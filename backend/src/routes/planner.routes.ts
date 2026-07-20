import { Router } from 'express';
import { getPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem } from '../controllers/planner.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getPlannerItems);
router.post('/', createPlannerItem);
router.put('/:id', updatePlannerItem);
router.delete('/:id', deletePlannerItem);

export default router;
