import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  userId: mongoose.Types.ObjectId;
  subjectName: string;
  facultyName?: string;
  attendedClasses: number;
  totalClasses: number;
  minimumAttendance: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectName: { type: String, required: true, trim: true },
    facultyName: { type: String, default: '' },
    attendedClasses: { type: Number, default: 0, min: 0 },
    totalClasses: { type: Number, default: 0, min: 0 },
    minimumAttendance: { type: Number, default: 75, min: 0, max: 100 },
    color: { type: String, default: '#2563EB' },
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);
