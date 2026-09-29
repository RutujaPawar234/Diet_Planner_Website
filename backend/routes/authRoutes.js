import { Router } from 'express';
import { getMe, login, logout, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { loginRules, registerRules } from '../validators/index.js';

const router = Router();

router.post('/register', authLimiter, validate(registerRules), register);
router.post('/login', authLimiter, validate(loginRules), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
