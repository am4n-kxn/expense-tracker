import { Router } from 'express';
import {
  getCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', renameCategory);
router.delete('/:id', deleteCategory);

export default router;
