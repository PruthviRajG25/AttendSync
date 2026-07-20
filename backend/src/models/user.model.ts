import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  college?: string;
  semester?: number;
  branch?: string;
  attendanceGoal: number;
  themePreference: 'light' | 'dark';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    college: { type: String, default: '' },
    semester: { type: Number, default: 1 },
    branch: { type: String, default: '' },
    attendanceGoal: { type: Number, default: 75 },
    themePreference: { type: String, enum: ['light', 'dark'], default: 'dark' },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password || '', salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export default mongoose.model<IUser>('User', UserSchema);
