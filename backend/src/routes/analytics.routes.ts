import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAnalyticsData);

export default router;
