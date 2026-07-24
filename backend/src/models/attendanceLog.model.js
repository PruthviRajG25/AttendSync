import mongoose from 'mongoose';

const AttendanceLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'holiday', 'exam', 'internal', 'lab'],
      required: true,
    },
    lectureNumber: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('AttendanceLog', AttendanceLogSchema);
