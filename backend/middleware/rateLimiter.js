import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/** Slows down brute-force attempts on login/register. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});
