import { Router } from 'express';
import { createMeal, deleteMeal, getMeal, getMeals, updateMeal } from '../controllers/mealController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, mealQueryRules, mealRules } from '../validators/index.js';

const router = Router();

router.use(protect);

// Ownership (custom meal) vs admin (catalog meal) is enforced inside the controller.
router.route('/').get(validate(mealQueryRules), getMeals).post(validate(mealRules()), createMeal);

router
  .route('/:id')
  .get(validate([idParam()]), getMeal)
  .put(validate(mealRules(true)), updateMeal)
  .delete(validate([idParam()]), deleteMeal);

export default router;
