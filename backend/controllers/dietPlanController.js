import { DietPlan } from '../models/DietPlan.js';
import { Profile } from '../models/Profile.js';
import { AppError } from '../utils/AppError.js';
import { MEAL_SLOTS } from '../utils/constants.js';
import { sendSuccess } from '../utils/helpers.js';
import { addDays, toDateOnly } from '../utils/date.js';
import { assertMealsAccessible } from '../services/mealService.js';
import {
  findEntry,
  findOwnPlan,
  generatePlanEntries,
  preparePlan,
  savePlan,
} from '../services/dietPlanService.js';

/** Extracts { breakfast: [...], lunch: [...] ... } from the body, normalising servings. */
function slotsFromBody(body) {
  const slots = {};
  for (const slot of MEAL_SLOTS) {
    if (Array.isArray(body[slot])) {
      slots[slot] = body[slot].map(({ meal, servings = 1, consumed = false }) => ({
        meal,
        servings: Number(servings),
        consumed: Boolean(consumed),
      }));
    }
  }
  return slots;
}

const mealIdsIn = (slots) => Object.values(slots).flatMap((entries) => entries.map((e) => e.meal));

// GET /api/diet-plans?from=YYYY-MM-DD&to=YYYY-MM-DD — history (defaults to last 30 days)
export async function getPlans(req, res) {
  const to = req.query.to ? toDateOnly(req.query.to) : new Date();
  const from = req.query.from ? toDateOnly(req.query.from) : addDays(to, -30);

  const plans = await DietPlan.find({ user: req.user._id, date: { $gte: from, $lte: to } })
    .select('date totalCalories totalProtein totalCarbohydrates totalFats consumedCalories generated')
    .sort({ date: -1 });
  sendSuccess(res, { plans });
}

// GET /api/diet-plans/date/:date — the plan for one day (null if none yet)
export async function getPlanByDate(req, res) {
  const plan = await DietPlan.findOne({ user: req.user._id, date: toDateOnly(req.params.date) });
  sendSuccess(res, { plan: await preparePlan(plan) });
}

// GET /api/diet-plans/:id
export async function getPlan(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  sendSuccess(res, { plan: await preparePlan(plan) });
}

// POST /api/diet-plans — create a (manual) plan for a date
export async function createPlan(req, res) {
  const date = toDateOnly(req.body.date);
  if (await DietPlan.exists({ user: req.user._id, date })) {
    throw new AppError('A plan already exists for this date', 409);
  }
  const slots = slotsFromBody(req.body);
  await assertMealsAccessible(mealIdsIn(slots), req.user);

  const plan = new DietPlan({ user: req.user._id, date, notes: req.body.notes, ...slots });
  sendSuccess(res, { plan: await savePlan(plan) }, 201, 'Diet plan created');
}

// POST /api/diet-plans/generate — build a personalised plan from the profile (replaces the day's plan)
export async function generatePlan(req, res) {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Complete your profile before generating a plan', 400);

  const date = toDateOnly(req.body.date);
  const slots = await generatePlanEntries(profile, req.user);

  let plan = await DietPlan.findOne({ user: req.user._id, date });
  const isNew = !plan;
  if (isNew) plan = new DietPlan({ user: req.user._id, date });
  plan.set({ ...slots, generated: true });

  sendSuccess(res, { plan: await savePlan(plan) }, isNew ? 201 : 200, 'Personalised plan generated');
}

// PUT /api/diet-plans/:id — replace slots / notes
export async function updatePlan(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  const slots = slotsFromBody(req.body);
  await assertMealsAccessible(mealIdsIn(slots), req.user);

  plan.set(slots);
  if (req.body.notes !== undefined) plan.notes = req.body.notes;
  sendSuccess(res, { plan: await savePlan(plan) }, 200, 'Diet plan updated');
}

// POST /api/diet-plans/:id/entries — add a meal to a slot
export async function addEntry(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  const { slot, meal, servings = 1 } = req.body;
  await assertMealsAccessible([meal], req.user);

  plan[slot].push({ meal, servings });
  sendSuccess(res, { plan: await savePlan(plan) }, 201, 'Meal added to plan');
}

// PATCH /api/diet-plans/:id/entries/:entryId — change servings, mark consumed, or move slot
export async function updateEntry(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  const { slot, entry } = findEntry(plan, req.params.entryId);
  const { servings, consumed, slot: targetSlot } = req.body;

  if (servings !== undefined) entry.servings = servings;
  if (consumed !== undefined) entry.consumed = consumed;
  if (targetSlot && targetSlot !== slot) {
    const moved = entry.toObject();
    plan[slot].pull(entry._id);
    plan[targetSlot].push(moved);
  }
  sendSuccess(res, { plan: await savePlan(plan) }, 200, 'Plan updated');
}

// DELETE /api/diet-plans/:id/entries/:entryId
export async function removeEntry(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  const { slot, entry } = findEntry(plan, req.params.entryId);
  plan[slot].pull(entry._id);
  sendSuccess(res, { plan: await savePlan(plan) }, 200, 'Meal removed from plan');
}

// DELETE /api/diet-plans/:id
export async function deletePlan(req, res) {
  const plan = await findOwnPlan(req.params.id, req.user);
  await plan.deleteOne();
  sendSuccess(res, null, 200, 'Diet plan deleted');
}
