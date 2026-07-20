import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string;
  subjectId: mongoose.Types.ObjectId;
}

const TimetableSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true,
    },
    timeSlot: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);
