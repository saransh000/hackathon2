const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private
exports.bookAppointment = async (req, res) => {
    try {
        const {
            doctorName,
            doctorSpecialty,
            appointmentDate,
            appointmentTime,
            consultationType,
            symptoms,
            additionalNotes
        } = req.body;

        // Validate required fields
        if (!doctorName || !doctorSpecialty || !appointmentDate || !appointmentTime || !symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if appointment date is in the future
        const selectedDate = new Date(appointmentDate);
        if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book appointments in the past'
            });
        }

        // Check for conflicting appointments
        const existingAppointment = await Appointment.findOne({
            appointmentDate: selectedDate,
            appointmentTime,
            doctorName,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.'
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            user: req.user._id,
            doctorName,
            doctorSpecialty,
            appointmentDate: selectedDate,
            appointmentTime,
            consultationType: consultationType || 'video',
            symptoms,
            additionalNotes: additionalNotes || '',
            status: 'pending'
        });

        // Populate user information
        await appointment.populate('user', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully! Awaiting confirmation.',
            appointment
        });

    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment',
            error: error.message
        });
    }
};

// @desc    Get user's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .sort({ appointmentDate: -1 })
            .lean();

        const upcoming = appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= new Date().setHours(0, 0, 0, 0) && 
                   (apt.status === 'pending' || apt.status === 'confirmed');
        });

        const past = appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate < new Date().setHours(0, 0, 0, 0) || 
                   apt.status === 'completed' || 
                   apt.status === 'cancelled';
        });

        res.json({
            success: true,
            appointments: {
                upcoming,
                past,
                all: appointments
            },
            count: appointments.length
        });

    } catch (error) {
        console.error('Get user appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments/all
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
    try {
        const { status, date, doctor } = req.query;
        
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const selectedDate = new Date(date);
            query.appointmentDate = {
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
            };
        }
        
        if (doctor) {
            query.doctorName = new RegExp(doctor, 'i');
        }

        const appointments = await Appointment.find(query)
            .populate('user', 'name email phone age gender')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        const stats = {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        };

        res.json({
            success: true,
            appointments,
            stats
        });

    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private/Admin
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status, adminNotes, meetingLink } = req.body;
        
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Update status
        if (status) {
            appointment.status = status;
        }

        // Update admin notes
        if (adminNotes) {
            appointment.adminNotes = adminNotes;
        }

        // Update meeting link for video consultations
        if (meetingLink && appointment.consultationType === 'video') {
            appointment.meetingLink = meetingLink;
        }

        await appointment.save();
        await appointment.populate('user', 'name email phone');

        res.json({
            success: true,
            message: `Appointment ${status || 'updated'} successfully`,
            appointment
        });

    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment',
            error: error.message
        });
    }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user owns the appointment or is admin
        if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        // Check if appointment can be cancelled (not in past or already completed)
        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed appointment'
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
};

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date, doctor } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date'
            });
        }

        const selectedDate = new Date(date);
        
        // Define available time slots (9 AM to 5 PM, 30-min intervals)
        const allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00'
        ];

        // Get booked slots for the date and doctor
        let query = {
            appointmentDate: {
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['pending', 'confirmed'] }
        };

        if (doctor) {
            query.doctorName = doctor;
        }

        const bookedAppointments = await Appointment.find(query).select('appointmentTime');
        const bookedSlots = bookedAppointments.map(apt => apt.appointmentTime);

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({
            success: true,
            date: selectedDate.toDateString(),
            availableSlots,
            bookedSlots,
            totalSlots: allSlots.length,
            availableCount: availableSlots.length
        });

    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available slots',
            error: error.message
        });
    }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'name email phone age gender');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        if (appointment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.json({
            success: true,
            appointment
        });

    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointment',
            error: error.message
        });
    }
};
