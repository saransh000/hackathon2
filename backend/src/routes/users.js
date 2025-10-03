const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getUserStats,
  deleteAccount,
  changePassword
} = require('../controllers/userController');

const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('profile.age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('profile.gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender value'),
  body('profile.phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number format'),
  body('medicalHistory.bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
    .withMessage('Invalid blood type'),
  body('preferences.privacyLevel')
    .optional()
    .isIn(['public', 'private', 'limited'])
    .withMessage('Invalid privacy level')
], updateProfile);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', getUserStats);

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], deleteAccount);

module.exports = router;