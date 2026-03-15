import express from 'express';
import { register, login, getMe, logout, getCounselors, getStudentUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/auth/counselors
 * @desc    Get all counselors (for teacher to assign)
 * @access  Private (Teacher only)
 */
router.get('/counselors', protect, getCounselors);

/**
 * @route   GET /api/auth/students
 * @desc    Get all registered student users (for teacher dashboard)
 * @access  Private (Teacher only)
 */
router.get('/students', protect, getStudentUsers);

export default router;
