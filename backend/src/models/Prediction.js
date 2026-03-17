import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    riskScore: {
      type: Number,
      required: [true, 'Risk score is required'],
      min: [0, 'Risk score cannot be negative'],
      max: [100, 'Risk score cannot exceed 100'],
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Risk level is required'],
    },
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    predictionDate: {
      type: Date,
      default: Date.now,
    },
    inputData: {
      attendancePercentage: Number,
      internalMarks: Number,
      assignmentCompletion: Number,
      familyIncome: Number,
      travelDistance: Number,
      previousFailures: Number,
      engagementScore: Number,
    },
    modelVersion: {
      type: String,
      default: '1.0',
    },
    predictedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Predictor (teacher) ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
predictionSchema.index({ studentId: 1 });
predictionSchema.index({ riskLevel: 1 });
predictionSchema.index({ predictionDate: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

export default Prediction;
