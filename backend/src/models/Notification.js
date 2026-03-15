import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxLength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['risk', 'counseling', 'update', 'system'],
      required: [true, 'Notification type is required'],
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    relatedStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    relatedCounselingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counseling',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
