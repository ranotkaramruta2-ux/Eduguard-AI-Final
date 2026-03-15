import Student from '../models/Student.js';
import User from '../models/User.js';
import { parseCSVFile, validateStudentCSV } from '../utils/csvParser.js';
import { cleanupFile } from '../services/csvUploadService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Add a new student
 * @route   POST /api/students
 * @access  Private (Teacher only)
 */
export const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      phoneNumber,
      attendancePercentage,
      internalMarks,
      assignmentCompletion,
      familyIncome,
      travelDistance,
      previousFailures,
      engagementScore,
    } = req.body;

    // Validation
    if (
      !name ||
      !rollNumber ||
      attendancePercentage === undefined ||
      internalMarks === undefined ||
      assignmentCompletion === undefined ||
      familyIncome === undefined ||
      travelDistance === undefined ||
      previousFailures === undefined ||
      engagementScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required student information',
      });
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists',
      });
    }

    // If an email is provided, ensure there is a corresponding User account
    // for the student. We create it here with role "student" and set the
    // initial password to the same value as the email so that the student
    // can log in immediately using email as both username and password.
    let studentUserId = undefined;
    if (email) {
      let studentUser = await User.findOne({ email });

      if (!studentUser) {
        // No existing user → create a new student account
        studentUser = await User.create({
          name,
          email,
          password: email, // will be hashed by the User model pre-save hook
          role: 'student',
          phoneNumber,
        });
      } else if (studentUser.role === 'student') {
        // Existing student account → reset initial password to email
        studentUser.password = email;
        await studentUser.save();
      }

      studentUserId = studentUser._id;
    }

    // Create student
    const student = await Student.create({
      name,
      rollNumber,
      email,
      phoneNumber,
      attendancePercentage,
      internalMarks,
      assignmentCompletion,
      familyIncome,
      travelDistance,
      previousFailures,
      engagementScore,
      teacherId: req.user._id,
      userId: studentUserId,
    });

    logger.success(`New student added: ${name} (${rollNumber}) by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding student',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
export const getAllStudents = async (req, res) => {
  try {
    let query = {};

    // If teacher, show their students + all registered student users
    if (req.user.role === 'teacher') {
      // Get students added by this teacher
      const teacherStudents = await Student.find({ teacherId: req.user._id })
        .populate('teacherId', 'name email')
        .populate('counselorId', 'name email')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      // Get all users with role 'student' who signed up independently
      const registeredStudentUsers = await User.find({ 
        role: 'student',
        isActive: true 
      }).select('name email phoneNumber createdAt').sort({ createdAt: -1 });

      // Get IDs of students that already have Student records
      const existingStudentUserIds = teacherStudents
        .filter(s => s.userId)
        .map(s => s.userId._id.toString());

      // Filter out registered users who already have Student records
      const independentStudents = registeredStudentUsers
        .filter(user => !existingStudentUserIds.includes(user._id.toString()))
        .map(user => ({
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          rollNumber: 'N/A',
          userId: user._id,
          isRegisteredOnly: true, // Flag to identify these students
          createdAt: user.createdAt,
        }));

      // Combine both lists
      const allStudents = [...teacherStudents, ...independentStudents];

      res.status(200).json({
        success: true,
        count: allStudents.length,
        data: allStudents,
      });
      return;
    }

    // If counselor, show only assigned students
    if (req.user.role === 'counselor') {
      query.counselorId = req.user._id;
    }

    // If student, show only their own record
    if (req.user.role === 'student') {
      query.userId = req.user._id;
    }

    const students = await Student.find(query)
      .populate('teacherId', 'name email')
      .populate('counselorId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('counselorId', 'name email')
      .populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check
    if (
      req.user.role === 'teacher' &&
      student.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    if (
      req.user.role === 'counselor' &&
      (!student.counselorId || student.counselorId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    if (
      req.user.role === 'student' &&
      student.userId &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this student',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    logger.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Teacher only)
 */
export const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    // If student record doesn't exist, check if it's a registered user
    if (!student) {
      // Check if this is a User ID (registered student without Student record)
      const user = await User.findById(req.params.id);
      
      if (user && user.role === 'student') {
        // Create a new Student record for this registered user
        const {
          attendancePercentage,
          internalMarks,
          assignmentCompletion,
          familyIncome,
          travelDistance,
          previousFailures,
          engagementScore,
        } = req.body;

        // Generate a roll number if not provided
        const rollNumber = req.body.rollNumber || `STU${Date.now()}`;

        student = await Student.create({
          name: user.name,
          rollNumber,
          email: user.email,
          phoneNumber: user.phoneNumber,
          attendancePercentage: attendancePercentage || 0,
          internalMarks: internalMarks || 0,
          assignmentCompletion: assignmentCompletion || 0,
          familyIncome: familyIncome || 0,
          travelDistance: travelDistance || 0,
          previousFailures: previousFailures || 0,
          engagementScore: engagementScore || 0,
          teacherId: req.user._id,
          userId: user._id,
        });

        logger.info(`Student record created for registered user: ${user.email} by ${req.user.email}`);

        return res.status(201).json({
          success: true,
          message: 'Student record created successfully',
          data: student,
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check - only teacher who added can update
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this student',
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Student updated: ${student.rollNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Teacher only)
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this student',
      });
    }

    await student.deleteOne();

    logger.info(`Student deleted: ${student.rollNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload CSV dataset and add multiple students
 * @route   POST /api/students/upload-csv
 * @access  Private (Teacher only)
 */
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file',
      });
    }

    const filePath = req.file.path;

    // Parse CSV file
    const parsedData = await parseCSVFile(filePath);

    // Validate CSV data
    const validation = validateStudentCSV(parsedData);

    if (!validation.isValid) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV data',
        errors: validation.errors,
      });
    }

    // Add teacherId to each student
    const studentsToAdd = validation.validData.map((student) => ({
      ...student,
      teacherId: req.user._id,
    }));

    // Bulk insert students
    const students = await Student.insertMany(studentsToAdd, { ordered: false });

    // Clean up uploaded file
    cleanupFile(filePath);

    logger.success(
      `${students.length} students uploaded from CSV by ${req.user.email}`
    );

    res.status(201).json({
      success: true,
      message: `${students.length} students added successfully`,
      data: students,
    });
  } catch (error) {
    // Clean up file even if there's an error
    if (req.file) {
      cleanupFile(req.file.path);
    }

    logger.error('CSV upload error:', error);

    // Handle duplicate key errors in bulk insert
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some students already exist (duplicate roll numbers)',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading CSV',
      error: error.message,
    });
  }
};

/**
 * @desc    Add a score snapshot for a student (academic history)
 * @route   POST /api/students/:id/score-history
 * @access  Private (Teacher only)
 */
export const addScoreSnapshot = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this student' });
    }

    const {
      term,
      attendancePercentage,
      internalMarks,
      assignmentCompletion,
      engagementScore,
      previousFailures,
    } = req.body;

    if (!term) {
      return res.status(400).json({ success: false, message: 'Term label is required' });
    }

    const snapshot = {
      term,
      attendancePercentage: attendancePercentage ?? student.attendancePercentage,
      internalMarks: internalMarks ?? student.internalMarks,
      assignmentCompletion: assignmentCompletion ?? student.assignmentCompletion,
      engagementScore: engagementScore ?? student.engagementScore,
      previousFailures: previousFailures ?? student.previousFailures,
      addedBy: req.user._id,
      recordedAt: new Date(),
    };

    student.scoreHistory.push(snapshot);
    await student.save();

    logger.info(`Score snapshot added for student ${student.rollNumber} by ${req.user.email}`);

    const populated = await Student.findById(student._id).populate('scoreHistory.addedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Score snapshot recorded successfully',
      data: populated.scoreHistory,
    });
  } catch (error) {
    logger.error('Add score snapshot error:', error);
    res.status(500).json({ success: false, message: 'Error adding score snapshot', error: error.message });
  }
};

/**
 * @desc    Get score history for a student
 * @route   GET /api/students/:id/score-history
 * @access  Private (Teacher of this student + the student themselves)
 */
export const getScoreHistory = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('scoreHistory.addedBy', 'name email');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Authorization
    if (req.user.role === 'teacher' && student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'student' && (!student.userId || student.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const history = [...student.scoreHistory].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    logger.error('Get score history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching score history', error: error.message });
  }
};
