import BehaviouralFeedback from '../models/BehaviouralFeedback.js';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

/**
 * @desc    Add behavioural feedback for a student
 * @route   POST /api/behavioural-feedback
 * @access  Private (Teacher only)
 */
export const addFeedback = async (req, res) => {
  try {
    const { studentId, term, category, severity, description, improvements } = req.body;

    if (!studentId || !category || !severity || !description) {
      return res.status(400).json({
        success: false,
        message: 'studentId, category, severity, and description are required',
      });
    }

    // Ensure student exists and belongs to this teacher
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this student' });
    }

    const feedback = await BehaviouralFeedback.create({
      studentId,
      teacherId: req.user._id,
      term: term || '',
      category,
      severity,
      description,
      improvements: improvements || [],
    });

    const populated = await BehaviouralFeedback.findById(feedback._id)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name rollNumber');

    logger.info(`Behavioural feedback added for student ${student.rollNumber} by ${req.user.email}`);

    res.status(201).json({ success: true, message: 'Feedback added successfully', data: populated });
  } catch (error) {
    logger.error('Add feedback error:', error);
    res.status(500).json({ success: false, message: 'Error adding feedback', error: error.message });
  }
};

/**
 * @desc    Get behavioural feedback for a specific student
 * @route   GET /api/behavioural-feedback/student/:studentId
 * @access  Private (Teacher of this student + the student themselves)
 */
export const getFeedbackForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Authorization checks
    if (req.user.role === 'teacher' && student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (
      req.user.role === 'student' &&
      (!student.userId || student.userId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const feedbacks = await BehaviouralFeedback.find({ studentId })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    logger.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Error fetching feedback', error: error.message });
  }
};

/**
 * @desc    Update a behavioural feedback entry
 * @route   PUT /api/behavioural-feedback/:id
 * @access  Private (Teacher only)
 */
export const updateFeedback = async (req, res) => {
  try {
    const feedback = await BehaviouralFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this feedback' });
    }

    const allowedFields = ['term', 'category', 'severity', 'description', 'improvements', 'isResolved'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        feedback[field] = req.body[field];
      }
    });

    await feedback.save();

    const populated = await BehaviouralFeedback.findById(feedback._id)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name rollNumber');

    logger.info(`Behavioural feedback ${feedback._id} updated by ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Feedback updated successfully', data: populated });
  } catch (error) {
    logger.error('Update feedback error:', error);
    res.status(500).json({ success: false, message: 'Error updating feedback', error: error.message });
  }
};

/**
 * @desc    Delete a behavioural feedback entry
 * @route   DELETE /api/behavioural-feedback/:id
 * @access  Private (Teacher only)
 */
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await BehaviouralFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();

    logger.info(`Behavioural feedback ${req.params.id} deleted by ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    logger.error('Delete feedback error:', error);
    res.status(500).json({ success: false, message: 'Error deleting feedback', error: error.message });
  }
};
