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

        // Validate appointment date is in the future
        const selectedDate = new Date(appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Appointment date must be in the future'
            });
        }

        // Check for conflicting appointments (same doctor, date, time)
        const existingAppointment = await Appointment.findOne({
            doctorName,
            appointmentDate: selectedDate,
            appointmentTime,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(409).json({
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
            additionalNotes
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
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
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        // Separate into upcoming and past
        const now = new Date();
        const upcoming = appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
        });

        const past = appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate < now || apt.status === 'cancelled' || apt.status === 'completed';
        });

        res.json({
            success: true,
            appointments: {
                upcoming,
                past,
                all: appointments
            }
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

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments/all
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
    try {
        const { status, date, doctor } = req.query;
        
        // Build query
        const query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const selectedDate = new Date(date);
            const nextDate = new Date(selectedDate);
            nextDate.setDate(nextDate.getDate() + 1);
            query.appointmentDate = {
                $gte: selectedDate,
                $lt: nextDate
            };
        }
        
        if (doctor) {
            query.doctorName = { $regex: doctor, $options: 'i' };
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

        // Update meeting link
        if (meetingLink) {
            appointment.meetingLink = meetingLink;
        }

        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            appointment
        });

    } catch (error) {
        console.error('Update appointment error:', error);
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

        // Check if user owns this appointment or is admin
        if (appointment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        // Can't cancel completed appointments
        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed appointment'
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

        if (!date || !doctor) {
            return res.status(400).json({
                success: false,
                message: 'Please provide date and doctor'
            });
        }

        const selectedDate = new Date(date);

        // Get all booked slots for this doctor on this date
        const bookedAppointments = await Appointment.find({
            doctorName: doctor,
            appointmentDate: selectedDate,
            status: { $in: ['pending', 'confirmed'] }
        }).select('appointmentTime');

        const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

        // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
        const allSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute of [0, 30]) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (!bookedTimes.includes(timeStr)) {
                    allSlots.push(timeStr);
                }
            }
        }

        res.json({
            success: true,
            availableSlots: allSlots
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
