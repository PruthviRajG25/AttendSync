import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'attendsync_fallback_secret_key_12345';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, college, semester, branch, attendanceGoal } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      college,
      semester,
      branch,
      attendanceGoal: attendanceGoal || 75,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        semester: user.semester,
        branch: user.branch,
        attendanceGoal: user.attendanceGoal,
        themePreference: user.themePreference,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        semester: user.semester,
        branch: user.branch,
        attendanceGoal: user.attendanceGoal,
        themePreference: user.themePreference,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'User with this email does not exist.' });
      return;
    }
    // Mocking forgot password action
    res.json({ message: 'Reset password link sent to registered email. (Demo: Use password "123456" or custom if register again).' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during password reset request.', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving profile.', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, college, semester, branch, attendanceGoal, themePreference } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (semester !== undefined) user.semester = Number(semester);
    if (branch !== undefined) user.branch = branch;
    if (attendanceGoal !== undefined) user.attendanceGoal = Number(attendanceGoal);
    if (themePreference !== undefined) user.themePreference = themePreference;

    await user.save();
    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        semester: user.semester,
        branch: user.branch,
        attendanceGoal: user.attendanceGoal,
        themePreference: user.themePreference,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating profile.', error: error.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    await User.findByIdAndDelete(userId);
    // Delete all related content
    const mongoose = require('mongoose');
    await mongoose.model('Subject').deleteMany({ userId });
    await mongoose.model('AttendanceLog').deleteMany({ userId });
    await mongoose.model('Timetable').deleteMany({ userId });
    await mongoose.model('StudyPlannerItem').deleteMany({ userId });

    res.json({ message: 'Account and all related records deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting account.', error: error.message });
  }
};
