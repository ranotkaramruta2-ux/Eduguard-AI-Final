import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxLength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    attendancePercentage: {
      type: Number,
      required: [true, 'Attendance percentage is required'],
      min: [0, 'Attendance cannot be negative'],
      max: [100, 'Attendance cannot exceed 100%'],
    },
    internalMarks: {
      type: Number,
      required: [true, 'Internal marks are required'],
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100'],
    },
    assignmentCompletion: {
      type: Number,
      required: [true, 'Assignment completion percentage is required'],
      min: [0, 'Assignment completion cannot be negative'],
      max: [100, 'Assignment completion cannot exceed 100%'],
    },
    familyIncome: {
      type: Number,
      required: [true, 'Family income is required'],
      min: [0, 'Family income cannot be negative'],
    },
    travelDistance: {
      type: Number,
      required: [true, 'Travel distance is required'],
      min: [0, 'Travel distance cannot be negative'],
    },
    previousFailures: {
      type: Number,
      required: [true, 'Previous failures count is required'],
      min: [0, 'Previous failures cannot be negative'],
      default: 0,
    },
    engagementScore: {
      type: Number,
      required: [true, 'Engagement score is required'],
      min: [0, 'Engagement score cannot be negative'],
      max: [100, 'Engagement score cannot exceed 100'],
    },
    riskScore: {
      type: Number,
      min: [0, 'Risk score cannot be negative'],
      max: [100, 'Risk score cannot exceed 100'],
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    recommendation: {
      type: String,
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    counselingStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
    },
    scoreHistory: [
      {
        term: {
          type: String,
          required: true,
          trim: true,
        },
        attendancePercentage: { type: Number, min: 0, max: 100 },
        internalMarks: { type: Number, min: 0, max: 100 },
        assignmentCompletion: { type: Number, min: 0, max: 100 },
        engagementScore: { type: Number, min: 0, max: 100 },
        previousFailures: { type: Number, min: 0, default: 0 },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (rollNumber already indexed via unique:true)
studentSchema.index({ teacherId: 1 });
studentSchema.index({ counselorId: 1 });
studentSchema.index({ riskLevel: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
