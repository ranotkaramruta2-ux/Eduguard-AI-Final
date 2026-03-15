import Counseling from '../models/Counseling.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import twilioService from '../services/twilioService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Assign counselor to a student
 * @route   POST /api/counseling/assign
 * @access  Private (Teacher only)
 */
export const assignCounselor = async (req, res) => {
  try {
    const { studentId, counselorId } = req.body;

    if (!studentId || !counselorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both studentId and counselorId',
      });
    }

    // Get student and counselor
    const student = await Student.findById(studentId);
    const counselor = await User.findById(counselorId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found',
      });
    }

    // Check if counseling already exists
    let counseling = await Counseling.findOne({
      studentId,
      status: { $in: ['pending', 'in_progress'] },
    });

    if (counseling) {
      // Update existing counseling
      counseling.counselorId = counselorId;
      await counseling.save();
    } else {
      // Create new counseling record
      counseling = await Counseling.create({
        studentId,
        counselorId,
        status: 'pending',
        notes: [
          {
            content: `Counselor ${counselor.name} assigned by ${req.user.name}`,
            addedBy: req.user._id,
          },
        ],
      });
    }

    // Update student record
    student.counselorId = counselorId;
    student.counselingStatus = 'pending';
    await student.save();

    // Create notifications
    await Notification.create({
      userId: counselorId,
      message: `New student assigned: ${student.name} (${student.rollNumber})`,
      type: 'counseling',
      relatedStudentId: studentId,
      relatedCounselingId: counseling._id,
      priority: 'high',
    });

    if (student.userId) {
      await Notification.create({
        userId: student.userId,
        message: `Counselor ${counselor.name} has been assigned to you`,
        type: 'counseling',
        relatedCounselingId: counseling._id,
        priority: 'medium',
      });
    }

    // Send real-time notification via Socket.io
    if (req.io) {
      req.io.to(`user_${counselorId}`).emit('notification', {
        message: `New student assigned: ${student.name}`,
        type: 'counseling',
        studentId,
      });

      if (student.userId) {
        req.io.to(`user_${student.userId}`).emit('notification', {
          message: `Counselor ${counselor.name} assigned to you`,
          type: 'counseling',
        });
      }
    }

    // Send SMS notifications
    try {
      await twilioService.sendCounselorAssignmentAlert({
        studentName: student.name,
        studentPhone: student.phoneNumber,
        counselorName: counselor.name,
        counselorPhone: counselor.phoneNumber,
      });
    } catch (twilioError) {
      logger.warn('Twilio notification failed:', twilioError.message);
    }

    logger.success(
      `Counselor ${counselor.name} assigned to student ${student.name} by ${req.user.email}`
    );

    res.status(200).json({
      success: true,
      message: 'Counselor assigned successfully',
      data: counseling,
    });
  } catch (error) {
    logger.error('Assign counselor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning counselor',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all assigned students for counselor
 * @route   GET /api/counseling/assigned
 * @access  Private (Counselor only)
 */
export const getAssignedStudents = async (req, res) => {
  try {
    const counseling = await Counseling.find({ counselorId: req.user._id })
      .populate('studentId')
      .populate('counselorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: counseling.length,
      data: counseling,
    });
  } catch (error) {
    logger.error('Get assigned students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned students',
      error: error.message,
    });
  }
};

/**
 * @desc    Get counseling details for a student
 * @route   GET /api/counseling/student/:studentId
 * @access  Private
 */
export const getStudentCounseling = async (req, res) => {
  try {
    const { studentId } = req.params;

    const counseling = await Counseling.find({ studentId })
      .populate('studentId')
      .populate('counselorId', 'name email')
      .populate('notes.addedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: counseling.length,
      data: counseling,
    });
  } catch (error) {
    logger.error('Get student counseling error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counseling details',
      error: error.message,
    });
  }
};

/**
 * @desc    Add counseling note
 * @route   POST /api/counseling/notes
 * @access  Private (Counselor only)
 */
export const addCounselingNote = async (req, res) => {
  try {
    const { counselingId, note } = req.body;

    if (!counselingId || !note) {
      return res.status(400).json({
        success: false,
        message: 'Please provide counselingId and note',
      });
    }

    const counseling = await Counseling.findById(counselingId);

    if (!counseling) {
      return res.status(404).json({
        success: false,
        message: 'Counseling record not found',
      });
    }

    // Authorization check
    if (counseling.counselorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this counseling record',
      });
    }

    // Add note
    counseling.notes.push({
      content: note,
      addedBy: req.user._id,
    });

    counseling.lastSessionDate = new Date();
    counseling.sessionCount += 1;

    await counseling.save();

    // Populate the added note
    await counseling.populate('notes.addedBy', 'name role');

    // Create notification for student
    const student = await Student.findById(counseling.studentId);
    if (student && student.userId) {
      await Notification.create({
        userId: student.userId,
        message: `New counseling note added by ${req.user.name}`,
        type: 'update',
        relatedStudentId: student._id,
        relatedCounselingId: counseling._id,
        priority: 'medium',
      });

      // Send real-time notification
      if (req.io) {
        req.io.to(`user_${student.userId}`).emit('notification', {
          message: 'New counseling note added',
          type: 'update',
        });
      }
    }

    logger.success(`Counseling note added for student ID: ${counseling.studentId}`);

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: counseling,
    });
  } catch (error) {
    logger.error('Add counseling note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding counseling note',
      error: error.message,
    });
  }
};

/**
 * @desc    Update counseling status
 * @route   PUT /api/counseling/:id/status
 * @access  Private (Counselor only)
 */
export const updateCounselingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, in_progress, or resolved',
      });
    }

    const counseling = await Counseling.findById(id);

    if (!counseling) {
      return res.status(404).json({
        success: false,
        message: 'Counseling record not found',
      });
    }

    // Authorization check
    if (counseling.counselorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this counseling record',
      });
    }

    counseling.status = status;
    await counseling.save();

    // Update student counseling status
    await Student.findByIdAndUpdate(counseling.studentId, {
      counselingStatus: status,
    });

    logger.success(`Counseling status updated to ${status} for ID: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: counseling,
    });
  } catch (error) {
    logger.error('Update counseling status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating counseling status',
      error: error.message,
    });
  }
};
