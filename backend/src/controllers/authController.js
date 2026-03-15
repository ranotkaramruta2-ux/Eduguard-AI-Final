import User from '../models/User.js';
import Student from '../models/Student.js';
import { generateToken } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate role
    const validRoles = ['teacher', 'student', 'counselor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be teacher, student, or counselor',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
    });

    // Generate token
    const token = generateToken(user._id);

    logger.success(`New user registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.success(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message,
    });
  }
};

/**
 * @desc    Logout user / Clear token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all counselors (for teacher to assign)
 * @route   GET /api/auth/counselors
 * @access  Private
 */
export const getCounselors = async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor', isActive: true })
      .select('name email phoneNumber role')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: counselors.length,
      data: counselors,
    });
  } catch (error) {
    logger.error('Get counselors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counselors',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all registered student users (for teacher dashboard)
 * @route   GET /api/auth/students
 * @access  Private (Teacher only)
 */
export const getStudentUsers = async (req, res) => {
  try {
    // Only teachers should see the list of student accounts
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view student user accounts',
      });
    }

    // Fetch all active student users
    const users = await User.find({ role: 'student', isActive: true })
      .select('name email phoneNumber role');

    const userIds = users.map(u => u._id);

    // Find which of these already have student data linked
    const studentDocs = await Student.find({ userId: { $in: userIds } })
      .select('userId');

    const hasDataSet = new Set(studentDocs.map(s => s.userId.toString()));

    const data = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber,
      hasStudentData: hasDataSet.has(u._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    logger.error('Get student users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student users',
      error: error.message,
    });
  }
};
