import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import profileRoutes from './profileRoutes.js';
import mealRoutes from './mealRoutes.js';
import dietPlanRoutes from './dietPlanRoutes.js';
import progressRoutes from './progressRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/meals', mealRoutes);
router.use('/diet-plans', dietPlanRoutes);
router.use('/progress', progressRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
