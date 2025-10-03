const express = require('express');
const router = express.Router();

const {
  getDashboardOverview,
  getUserAnalytics,
  getAnalysisAnalytics,
  getSystemMetrics,
  generateReports
} = require('../controllers/adminController');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/admin/overview
// @desc    Get dashboard overview statistics
// @access  Private (Admin)
router.get('/overview', getDashboardOverview);

// @route   GET /api/admin/users
// @desc    Get user analytics
// @access  Private (Admin)
router.get('/users', getUserAnalytics);

// @route   GET /api/admin/analyses
// @desc    Get analysis analytics
// @access  Private (Admin)
router.get('/analyses', getAnalysisAnalytics);

// @route   GET /api/admin/system
// @desc    Get system metrics
// @access  Private (Admin)
router.get('/system', getSystemMetrics);

// @route   GET /api/admin/reports
// @desc    Generate reports
// @access  Private (Admin)
router.get('/reports', generateReports);

module.exports = router;