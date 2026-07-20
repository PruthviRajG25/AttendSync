import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceLog extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'holiday' | 'exam' | 'internal' | 'lab';
  lectureNumber: number;
  createdAt: Date;
}

const AttendanceLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
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

export default mongoose.model<IAttendanceLog>('AttendanceLog', AttendanceLogSchema);
