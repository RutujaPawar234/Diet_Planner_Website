import { Router } from 'express';
import {
  createProgress,
  deleteProgress,
  getProgress,
  updateProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, planListRules, progressRules } from '../validators/index.js';

const router = Router();

router.use(protect);

router.route('/').get(validate(planListRules), getProgress).post(validate(progressRules()), createProgress);
router
  .route('/:id')
  .put(validate(progressRules(true)), updateProgress)
  .delete(validate([idParam()]), deleteProgress);

export default router;
