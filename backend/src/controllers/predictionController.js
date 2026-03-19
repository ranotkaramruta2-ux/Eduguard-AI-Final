import Student from '../models/Student.js';
import Prediction from '../models/Prediction.js';
import Notification from '../models/Notification.js';
import Counseling from '../models/Counseling.js';
import User from '../models/User.js';
import mlPredictionService from '../services/mlPredictionService.js';
import twilioService from '../services/twilioService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Run prediction for a single student
 * @route   POST /api/predict/:studentId
 * @access  Private (Teacher only)
 */
export const runPrediction = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student data
    const student = await Student.findById(studentId).populate('teacherId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check
    if (
      req.user.role === 'teacher' &&
      student.teacherId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to run prediction for this student',
      });
    }

    // Get prediction from ML service
    const predictionResult = await mlPredictionService.getPrediction({
      attendancePercentage: student.attendancePercentage,
      internalMarks: student.internalMarks,
      assignmentCompletion: student.assignmentCompletion,
      familyIncome: student.familyIncome,
      travelDistance: student.travelDistance,
      previousFailures: student.previousFailures,
      engagementScore: student.engagementScore,
      scholarshipStatus: student.scholarshipStatus,
      partTimeJob: student.partTimeJob,
      numberOfDependents: student.numberOfDependents,
      disciplinaryActions: student.disciplinaryActions,
      socialMediaHours: student.socialMediaHours,
      extracurricularParticipation: student.extracurricularParticipation,
      hasChronicIllness: student.hasChronicIllness,
      mentalHealthConcern: student.mentalHealthConcern,
      missedDueMedical: student.missedDueMedical,
    });

    // Update student record with prediction
    student.riskScore = predictionResult.riskScore;
    student.riskLevel = predictionResult.riskLevel;
    student.recommendation = predictionResult.recommendation;
    student.riskFactors = predictionResult.riskFactors || [];
    student.counselorType = predictionResult.counselorType || 'general';
    await student.save();

    // Save prediction record
    const prediction = await Prediction.create({
      studentId: student._id,
      riskScore: predictionResult.riskScore,
      riskLevel: predictionResult.riskLevel,
      recommendation: predictionResult.recommendation,
      riskFactors: predictionResult.riskFactors || [],
      counselorType: predictionResult.counselorType || 'general',
      predictedBy: req.user._id,
      inputData: {
        attendancePercentage: student.attendancePercentage,
        internalMarks: student.internalMarks,
        assignmentCompletion: student.assignmentCompletion,
        familyIncome: student.familyIncome,
        travelDistance: student.travelDistance,
        previousFailures: student.previousFailures,
        engagementScore: student.engagementScore,
      },
    });

    // If high risk, auto-assign counselor and send notifications
    if (predictionResult.riskLevel === 'high') {
      await handleHighRiskStudent(student, req.user, req.io);
    }

    logger.success(
      `Prediction completed for ${student.name} (${student.rollNumber}): ${predictionResult.riskLevel} risk`
    );

    res.status(200).json({
      success: true,
      message: 'Prediction completed successfully',
      data: {
        student,
        prediction: predictionResult,
      },
    });
  } catch (error) {
    logger.error('Run prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running prediction',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all predictions
 * @route   GET /api/predictions
 * @access  Private (Teacher only)
 */
export const getAllPredictions = async (req, res) => {
  try {
    let query = {};

    // If teacher, show only predictions they made
    if (req.user.role === 'teacher') {
      query.predictedBy = req.user._id;
    }

    const predictions = await Prediction.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('predictedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 predictions

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    logger.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching predictions',
      error: error.message,
    });
  }
};

/**
 * @desc    Get predictions for a specific student
 * @route   GET /api/predictions/student/:studentId
 * @access  Private
 */
export const getStudentPredictions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const predictions = await Prediction.find({ studentId })
      .populate('predictedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    logger.error('Get student predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student predictions',
      error: error.message,
    });
  }
};

/**
 * Handle high-risk student detection
 * - Auto-assign counselor
 * - Send notifications to teacher, counselor, student
 * - Create counseling record
 */
async function handleHighRiskStudent(student, teacher, io) {
  try {
    // Find best-matched counselor based on risk factors
    const allCounselors = await User.find({ role: 'counselor', isActive: true });
    let counselor = null;

    if (allCounselors.length > 0) {
      const preferredExpertise = student.counselorType || 'general';

      // Try to find a counselor with matching expertise, fallback to general, then any
      counselor =
        allCounselors.find(c => c.expertise === preferredExpertise) ||
        allCounselors.find(c => c.expertise === 'general') ||
        allCounselors[0];
    }

    if (counselor) {
      // Assign counselor to student
      student.counselorId = counselor._id;
      student.counselingStatus = 'pending';
      await student.save();

      // Create counseling record
      await Counseling.create({
        studentId: student._id,
        counselorId: counselor._id,
        status: 'pending',
        notes: [
          {
            content: `Student automatically assigned due to high risk score (${student.riskScore}). Risk factors: ${(student.riskFactors || []).join('; ') || 'N/A'}. Initial counseling session required.`,
            addedBy: teacher._id,
          },
        ],
      });

      // Create notifications for teacher
      await Notification.create({
        userId: teacher._id,
        message: `High-risk student detected: ${student.name} (Risk Score: ${student.riskScore}). ${student.counselorType ? `Primary concern: ${student.counselorType}. ` : ''}Counselor ${counselor.name} [${counselor.expertise || 'general'}] has been assigned.`,
        type: 'risk',
        relatedStudentId: student._id,
        priority: 'high',
      });

      // Create notification for counselor
      await Notification.create({
        userId: counselor._id,
        message: `New high-risk student assigned: ${student.name} (Risk Score: ${student.riskScore}). Key concerns: ${(student.riskFactors || []).slice(0, 2).join(', ') || 'N/A'}.`,
        type: 'counseling',
        relatedStudentId: student._id,
        priority: 'high',
      });

      // Create notification for student (if userId exists)
      if (student.userId) {
        await Notification.create({
          userId: student.userId,
          message: `You have been assigned to counselor ${counselor.name}. They will contact you soon for a counseling session.`,
          type: 'counseling',
          relatedStudentId: student._id,
          priority: 'high',
        });
      }

      // Send real-time notifications via Socket.io
      if (io) {
        io.to(`user_${teacher._id}`).emit('notification', {
          message: `High-risk student detected: ${student.name}`,
          type: 'risk',
          studentId: student._id,
        });

        io.to(`user_${counselor._id}`).emit('notification', {
          message: `New high-risk student assigned: ${student.name}`,
          type: 'counseling',
          studentId: student._id,
        });

        if (student.userId) {
          io.to(`user_${student.userId}`).emit('notification', {
            message: `Counselor ${counselor.name} has been assigned to you`,
            type: 'counseling',
          });
        }
      }

      // Send SMS notifications via Twilio
      try {
        await twilioService.sendHighRiskAlert({
          studentName: student.name,
          studentPhone: student.phoneNumber,
          teacherPhone: teacher.phoneNumber,
          counselorPhone: counselor.phoneNumber,
          riskScore: student.riskScore,
        });
      } catch (twilioError) {
        logger.warn('Twilio notification failed:', twilioError.message);
      }

      logger.success(
        `High-risk student ${student.name} assigned to counselor ${counselor.name}`
      );
    } else {
      logger.warn('No available counselor found for high-risk student assignment');
    }
  } catch (error) {
    logger.error('Error handling high-risk student:', error);
  }
}
