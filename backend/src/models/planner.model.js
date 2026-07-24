import mongoose from 'mongoose';

const StudyPlannerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Exam', 'Assignment', 'Internal Test', 'Lab Exam', 'Project Milestone'],
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Todo', 'Done'], default: 'Todo' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: false },
  },
  { timestamps: true }
);

export default mongoose.model('StudyPlannerItem', StudyPlannerSchema);
