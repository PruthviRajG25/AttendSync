import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import attendanceRoutes from './routes/attendance.routes';
import timetableRoutes from './routes/timetable.routes';
import plannerRoutes from './routes/planner.routes';
import analyticsRoutes from './routes/analytics.routes';
import { seedMockData } from './controllers/seeder.controller';
import { authenticateToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendsync';

// Middleware
app.use(cors({
  origin: '*', // For development, allow all origins. Can be restricted to local frontend PORT in production.
  credentials: true
}));
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Mock data seeder route (Requires Auth)
app.post('/api/seed', authenticateToken, seedMockData);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the AttendSync API service.' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error details:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred.', error: err.message });
});

// Middleware to ensure DB connection in serverless environments
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
  next();
});

// Database connection & start server for local/standalone execution
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB successfully connected.');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

export default app;

