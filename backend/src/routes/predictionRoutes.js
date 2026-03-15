import express from 'express';
import {
  runPrediction,
  getAllPredictions,
  getStudentPredictions,
} from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/predict/:studentId
 * @desc    Run prediction for a single student
 * @access  Private (Teacher only)
 */
router.post('/:studentId', protect, authorize('teacher'), runPrediction);

/**
 * @route   GET /api/predictions
 * @desc    Get all predictions
 * @access  Private (Teacher only)
 */
router.get('/', protect, authorize('teacher'), getAllPredictions);

/**
 * @route   GET /api/predictions/student/:studentId
 * @desc    Get predictions for a specific student
 * @access  Private
 */
router.get('/student/:studentId', protect, getStudentPredictions);

export default router;
