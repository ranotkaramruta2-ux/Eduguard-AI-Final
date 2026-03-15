import mongoose from 'mongoose';

const counselingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Counselor ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
      required: true,
    },
    notes: [
      {
        content: {
          type: String,
          required: [true, 'Note content is required'],
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    resolvedDate: {
      type: Date,
    },
    sessionCount: {
      type: Number,
      default: 0,
      min: [0, 'Session count cannot be negative'],
    },
    lastSessionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
counselingSchema.index({ studentId: 1 });
counselingSchema.index({ counselorId: 1 });
counselingSchema.index({ status: 1 });

// Update resolved date when status changes to resolved
counselingSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedDate) {
    this.resolvedDate = new Date();
  }
  next();
});

const Counseling = mongoose.model('Counseling', counselingSchema);

export default Counseling;
