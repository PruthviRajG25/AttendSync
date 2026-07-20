import { Router } from 'express';
import { getTimetable, createSlot, deleteSlot } from '../controllers/timetable.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getTimetable);
router.post('/', createSlot);
router.delete('/:id', deleteSlot);

export default router;
