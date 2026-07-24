import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getAnalyticsData);

export default router;
