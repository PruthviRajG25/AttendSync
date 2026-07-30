import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Fix Node.js SRV resolution issue on certain local networks/OSes
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

// Configure dotenv first
dotenv.config();

// Import routes with exact .js extension
import authRoutes from './routes/auth.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import plannerRoutes from './routes/planner.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { seedMockData } from './controllers/seeder.controller.js';
import { authenticateToken } from './middleware/auth.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendsync';

// CORS and Body Parser
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Database connection state cache for serverless
let cachedConnection = null;

const connectDb = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  console.log('Connecting to MongoDB...');
  cachedConnection = await mongoose.connect(MONGODB_URI);
  console.log('MongoDB successfully connected.');
  return cachedConnection;
};

// Database connection middleware for Serverless compatibility
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(500).json({ message: 'Database connection failed.', error: err.message });
  }
});

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Mock data seeder route
app.post('/api/seed', authenticateToken, seedMockData);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AttendSync API service.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error details:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred.', error: err.message });
});

// Local development listening boot block (bypassed on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

export default app;
