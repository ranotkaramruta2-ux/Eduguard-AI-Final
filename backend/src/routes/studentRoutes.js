import express from 'express';
import {
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadCSV,
  addScoreSnapshot,
  getScoreHistory,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../services/csvUploadService.js';

const router = express.Router();

/**
 * @route   POST /api/students
 * @desc    Add a new student
 * @access  Private (Teacher only)
 */
router.post('/', protect, authorize('teacher'), addStudent);

/**
 * @route   GET /api/students
 * @desc    Get all students (filtered by role)
 * @access  Private
 */
router.get('/', protect, getAllStudents);

/**
 * @route   POST /api/students/upload-csv
 * @desc    Upload CSV dataset and add multiple students
 * @access  Private (Teacher only)
 * NOTE: must be BEFORE /:id so 'upload-csv' is not swallowed as an :id param
 */
router.post(
  '/upload-csv',
  protect,
  authorize('teacher'),
  upload.single('file'),
  uploadCSV
);

/**
 * @route   POST /api/students/:id/score-history
 * @desc    Record academic score snapshot for a student
 * @access  Private (Teacher only)
 * NOTE: must be BEFORE GET /:id so /:id/score-history is matched correctly
 */
router.post('/:id/score-history', protect, authorize('teacher'), addScoreSnapshot);

/**
 * @route   GET /api/students/:id/score-history
 * @desc    Get score history for a student
 * @access  Private (Teacher + Student)
 * NOTE: must be BEFORE GET /:id to avoid wildcard swallowing
 */
router.get('/:id/score-history', protect, getScoreHistory);

/**
 * @route   GET /api/students/:id
 * @desc    Get single student
 * @access  Private
 */
router.get('/:id', protect, getStudent);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Private (Teacher only)
 */
router.put('/:id', protect, authorize('teacher'), updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private (Teacher only)
 */
router.delete('/:id', protect, authorize('teacher'), deleteStudent);

export default router;
