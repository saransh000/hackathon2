const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  analyzeSymptoms,
  getAnalysisHistory,
  getAnalysis,
  submitFeedback
} = require('../controllers/analysisController');

const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/analysis/analyze
// @desc    Analyze symptoms with AI
// @access  Private
router.post('/analyze', [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptom description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Symptom description must be between 10 and 2000 characters')
    .trim()
], analyzeSymptoms);

// @route   GET /api/analysis/history
// @desc    Get user's analysis history
// @access  Private
router.get('/history', getAnalysisHistory);

// @route   GET /api/analysis/:id
// @desc    Get specific analysis
// @access  Private
router.get('/:id', getAnalysis);

// @route   POST /api/analysis/:id/feedback
// @desc    Submit feedback for analysis
// @access  Private
router.post('/:id/feedback', [
  body('helpful')
    .isBoolean()
    .withMessage('Helpful must be a boolean value'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
    .trim()
], submitFeedback);

module.exports = router;