import { Router } from 'express';
import { register, login, forgotPassword, getProfile, updateProfile, deleteAccount } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.delete('/delete-account', authenticateToken, deleteAccount);

export default router;
