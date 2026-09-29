import { Router } from 'express';
import { deleteUser, getUsers, updateMe, updateUserRole } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, updateMeRules, updateRoleRules } from '../validators/index.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(protect);

// Any authenticated user
router.patch('/me', validate(updateMeRules), updateMe);

// Admin only (role-based authorization)
router.get('/', authorize(ROLES.ADMIN), getUsers);
router.patch('/:id/role', authorize(ROLES.ADMIN), validate(updateRoleRules), updateUserRole);
router.delete('/:id', authorize(ROLES.ADMIN), validate([idParam()]), deleteUser);

export default router;
