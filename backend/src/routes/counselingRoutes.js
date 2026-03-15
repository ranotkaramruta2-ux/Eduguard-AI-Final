import express from 'express';
import {
  assignCounselor,
  getAssignedStudents,
  getStudentCounseling,
  addCounselingNote,
  updateCounselingStatus,
} from '../controllers/counselingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/counseling/assign
 * @desc    Assign counselor to a student
 * @access  Private (Teacher only)
 */
router.post('/assign', protect, authorize('teacher'), assignCounselor);

/**
 * @route   GET /api/counseling/assigned
 * @desc    Get all assigned students for counselor
 * @access  Private (Counselor only)
 */
router.get('/assigned', protect, authorize('counselor'), getAssignedStudents);

/**
 * @route   GET /api/counseling/student/:studentId
 * @desc    Get counseling details for a student
 * @access  Private
 */
router.get('/student/:studentId', protect, getStudentCounseling);

/**
 * @route   POST /api/counseling/notes
 * @desc    Add counseling note
 * @access  Private (Counselor only)
 */
router.post('/notes', protect, authorize('counselor'), addCounselingNote);

/**
 * @route   PUT /api/counseling/:id/status
 * @desc    Update counseling status
 * @access  Private (Counselor only)
 */
router.put('/:id/status', protect, authorize('counselor'), updateCounselingStatus);

export default router;
