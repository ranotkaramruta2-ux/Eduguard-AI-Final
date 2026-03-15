import express from 'express';
import {
  addFeedback,
  getFeedbackForStudent,
  updateFeedback,
  deleteFeedback,
} from '../controllers/behaviouralFeedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/behavioural-feedback
 * @desc    Add behavioural feedback for a student
 * @access  Private (Teacher only)
 */
router.post('/', protect, authorize('teacher'), addFeedback);

/**
 * @route   GET /api/behavioural-feedback/student/:studentId
 * @desc    Get all feedback for a specific student
 * @access  Private (Teacher + Student)
 */
router.get('/student/:studentId', protect, getFeedbackForStudent);

/**
 * @route   PUT /api/behavioural-feedback/:id
 * @desc    Update a feedback entry
 * @access  Private (Teacher only)
 */
router.put('/:id', protect, authorize('teacher'), updateFeedback);

/**
 * @route   DELETE /api/behavioural-feedback/:id
 * @desc    Delete a feedback entry
 * @access  Private (Teacher only)
 */
router.delete('/:id', protect, authorize('teacher'), deleteFeedback);

export default router;
