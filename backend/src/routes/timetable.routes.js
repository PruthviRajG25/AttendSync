import { Router } from 'express';
import { getTimetable, createSlot, deleteSlot } from '../controllers/timetable.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTimetable);
router.post('/', createSlot);
router.delete('/:id', deleteSlot);

export default router;
