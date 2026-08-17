import { Router } from 'express';
import { googleSignIn, getCurrentUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/google', googleSignIn);
router.get('/me', requireAuth, getCurrentUser);

export default router;
