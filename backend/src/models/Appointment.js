const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    doctorName: {
        type: String,
        required: true,
        trim: true
    },
    doctorSpecialty: {
        type: String,
        required: true,
        trim: true
    },
    appointmentDate: {
        type: Date,
        required: true,
        index: true
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
        default: 'pending',
        index: true
    },
    symptoms: {
        type: String,
        required: true
    },
    additionalNotes: {
        type: String
    },
    adminNotes: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    duration: {
        type: Number,
        default: 30 // minutes
    },
    meetingLink: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ user: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Virtual for full date-time
appointmentSchema.virtual('fullDateTime').get(function() {
    const date = new Date(this.appointmentDate);
    const [hours, minutes] = this.appointmentTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    return date;
});

// Instance method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
    const now = new Date();
    return this.fullDateTime > now && this.status === 'confirmed';
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function(userId) {
    const now = new Date();
    return this.find({
        user: userId,
        appointmentDate: { $gte: now },
        status: { $in: ['pending', 'confirmed'] }
    }).sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to get appointments by status
appointmentSchema.statics.getByStatus = function(status) {
    return this.find({ status })
        .populate('user', 'name email phone')
        .sort({ appointmentDate: 1, appointmentTime: 1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);
