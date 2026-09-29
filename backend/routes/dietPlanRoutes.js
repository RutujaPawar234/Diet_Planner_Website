import { Router } from 'express';
import {
  addEntry,
  createPlan,
  deletePlan,
  generatePlan,
  getPlan,
  getPlanByDate,
  getPlans,
  removeEntry,
  updateEntry,
  updatePlan,
} from '../controllers/dietPlanController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addEntryRules,
  createPlanRules,
  entryParamRules,
  generatePlanRules,
  idParam,
  planDateRules,
  planListRules,
  updateEntryRules,
  updatePlanRules,
} from '../validators/index.js';

const router = Router();

router.use(protect);

router.route('/').get(validate(planListRules), getPlans).post(validate(createPlanRules), createPlan);
router.post('/generate', validate(generatePlanRules), generatePlan);
router.get('/date/:date', validate(planDateRules), getPlanByDate);

router
  .route('/:id')
  .get(validate([idParam()]), getPlan)
  .put(validate(updatePlanRules), updatePlan)
  .delete(validate([idParam()]), deletePlan);

router.post('/:id/entries', validate(addEntryRules), addEntry);
router
  .route('/:id/entries/:entryId')
  .patch(validate(updateEntryRules), updateEntry)
  .delete(validate(entryParamRules), removeEntry);

export default router;
