const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    doctorSpecialty: {
        type: String,
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    consultationType: {
        type: String,
        enum: ['video', 'in-person', 'phone'],
        default: 'video'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending'
    },
    symptoms: {
        type: String,
        required: true
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    adminNotes: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    duration: {
        type: Number,
        default: 30 // in minutes
    },
    meetingLink: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ user: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Virtual for full appointment datetime
appointmentSchema.virtual('fullDateTime').get(function() {
    return `${this.appointmentDate.toDateString()} at ${this.appointmentTime}`;
});

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
    const appointmentDateTime = new Date(this.appointmentDate);
    const [hours, minutes] = this.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    return appointmentDateTime > new Date() && this.status === 'confirmed';
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function(userId) {
    return this.find({
        user: userId,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] }
    }).sort({ appointmentDate: 1 });
};

// Static method to get appointments by status
appointmentSchema.statics.getByStatus = function(status) {
    return this.find({ status })
        .populate('user', 'name email phone')
        .sort({ appointmentDate: 1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
