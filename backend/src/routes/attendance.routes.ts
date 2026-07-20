import { Router } from 'express';
import { getLogs, createLog, quickUpdate, deleteLog } from '../controllers/attendance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getLogs);
router.post('/', createLog);
router.post('/quick', quickUpdate);
router.delete('/:id', deleteLog);

export default router;
