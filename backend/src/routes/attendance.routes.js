import { Router } from 'express';
import { getLogs, createLog, quickUpdate, deleteLog } from '../controllers/attendance.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getLogs);
router.post('/', createLog);
router.post('/quick', quickUpdate);
router.delete('/:id', deleteLog);

export default router;
