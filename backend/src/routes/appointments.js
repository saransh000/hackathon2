const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getUserAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAvailableSlots,
    getAppointmentById
} = require('../controllers/appointmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/available-slots', getAvailableSlots);

// Protected routes (user must be logged in)
router.post('/book', authMiddleware, bookAppointment);
router.get('/my-appointments', authMiddleware, getUserAppointments);
router.get('/:id', authMiddleware, getAppointmentById);
router.patch('/:id/cancel', authMiddleware, cancelAppointment);

// Admin only routes
router.get('/all', authMiddleware, adminMiddleware, getAllAppointments);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAppointmentStatus);

module.exports = router;
