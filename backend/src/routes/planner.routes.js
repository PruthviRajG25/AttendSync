import { Router } from 'express';
import { getPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem } from '../controllers/planner.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getPlannerItems);
router.post('/', createPlannerItem);
router.put('/:id', updatePlannerItem);
router.delete('/:id', deletePlannerItem);

export default router;
