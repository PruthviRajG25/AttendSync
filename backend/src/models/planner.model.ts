import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyPlannerItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'Exam' | 'Assignment' | 'Internal Test' | 'Lab Exam' | 'Project Milestone';
  dueDate: Date;
  status: 'Todo' | 'Done';
  subjectId?: mongoose.Types.ObjectId;
}

const StudyPlannerSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Exam', 'Assignment', 'Internal Test', 'Lab Exam', 'Project Milestone'],
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Todo', 'Done'], default: 'Todo' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IStudyPlannerItem>('StudyPlannerItem', StudyPlannerSchema);
