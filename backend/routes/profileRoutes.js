import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileRules } from '../validators/index.js';

const router = Router();

router.use(protect);
router.route('/').get(getProfile).put(validate(profileRules), upsertProfile);

export default router;
