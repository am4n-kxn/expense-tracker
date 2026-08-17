import { Router } from 'express';
import {
  getBudgets,
  upsertBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBudgets);
router.post('/', upsertBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
