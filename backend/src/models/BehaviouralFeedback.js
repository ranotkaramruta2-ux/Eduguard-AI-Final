import mongoose from 'mongoose';

const behaviouralFeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
    },
    term: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['attendance', 'participation', 'discipline', 'attitude', 'academic', 'other'],
      required: [true, 'Category is required'],
    },
    severity: {
      type: String,
      enum: ['positive', 'minor_concern', 'major_concern'],
      required: [true, 'Severity is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    improvements: {
      type: [String],
      default: [],
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

behaviouralFeedbackSchema.index({ studentId: 1 });
behaviouralFeedbackSchema.index({ teacherId: 1 });
behaviouralFeedbackSchema.index({ studentId: 1, teacherId: 1 });

const BehaviouralFeedback = mongoose.model('BehaviouralFeedback', behaviouralFeedbackSchema);

export default BehaviouralFeedback;
