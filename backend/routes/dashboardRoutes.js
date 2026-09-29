import { Router } from 'express';
import { getAdminStats, getDashboard } from '../controllers/dashboardController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { dashboardRules } from '../validators/index.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect);

router.get('/', validate(dashboardRules), getDashboard);
router.get('/admin', authorize(ROLES.ADMIN), getAdminStats);

export default router;
