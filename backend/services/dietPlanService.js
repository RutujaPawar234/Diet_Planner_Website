import { DietPlan } from '../models/DietPlan.js';
import { Meal } from '../models/Meal.js';
import { AppError } from '../utils/AppError.js';
import { MEAL_SLOTS } from '../utils/constants.js';
import { round } from '../utils/helpers.js';
import { compatibilityFilter, containsAllergy, visibleMealsFilter } from './mealService.js';

// Share of the daily calorie target given to each meal slot.
export const SLOT_SPLIT = Object.freeze({ breakfast: 0.25, lunch: 0.35, snacks: 0.1, dinner: 0.3 });

const MEAL_FIELDS = 'name category calories protein carbohydrates fats ingredients dietaryType allergens servingSize isCustom';
const POPULATE = MEAL_SLOTS.map((slot) => ({ path: `${slot}.meal`, select: MEAL_FIELDS }));

export const populatePlan = (plan) => plan.populate(POPULATE);

/**
 * Recalculates nutrition totals from the populated entries and stores them on
 * the plan. Entries whose meal was deleted are dropped.
 */
export function applyTotals(plan) {
  const totals = { calories: 0, protein: 0, carbohydrates: 0, fats: 0, consumed: 0 };

  for (const slot of MEAL_SLOTS) {
    const valid = plan[slot].filter((entry) => entry.meal && typeof entry.meal === 'object');
    if (valid.length !== plan[slot].length) plan[slot] = valid;
    for (const { meal, servings, consumed } of plan[slot]) {
      totals.calories += meal.calories * servings;
      totals.protein += meal.protein * servings;
      totals.carbohydrates += meal.carbohydrates * servings;
      totals.fats += meal.fats * servings;
      if (consumed) totals.consumed += meal.calories * servings;
    }
  }

  plan.totalCalories = Math.round(totals.calories);
  plan.totalProtein = round(totals.protein, 1);
  plan.totalCarbohydrates = round(totals.carbohydrates, 1);
  plan.totalFats = round(totals.fats, 1);
  plan.consumedCalories = Math.round(totals.consumed);
  return plan;
}

/** Populate → recompute totals → save. Use after every plan mutation. */
export async function savePlan(plan) {
  await populatePlan(plan);
  applyTotals(plan);
  await plan.save();
  return plan;
}

/**
 * Populates a plan for a response. If meals were deleted since the last save,
 * the stale entries are dropped and the corrected totals persisted.
 */
export async function preparePlan(plan) {
  if (!plan) return null;
  await populatePlan(plan);
  applyTotals(plan);
  if (plan.isModified()) await plan.save();
  return plan;
}

export async function findOwnPlan(id, user) {
  const plan = await DietPlan.findOne({ _id: id, user: user._id });
  if (!plan) throw new AppError('Diet plan not found', 404);
  return plan;
}

export function findEntry(plan, entryId) {
  for (const slot of MEAL_SLOTS) {
    const entry = plan[slot].id(entryId);
    if (entry) return { slot, entry };
  }
  throw new AppError('Meal entry not found in this plan', 404);
}

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

/**
 * Chooses meals for one slot so that their calories land close to the budget.
 * Picks randomly among the 3 closest candidates for variety, scales servings in
 * half steps, and adds a small side dish when a large gap remains.
 */
function chooseForSlot(candidates, budget) {
  if (!candidates.length) return [];

  const closest = [...candidates]
    .sort((a, b) => Math.abs(a.calories - budget) - Math.abs(b.calories - budget))
    .slice(0, 3);
  const main = pickRandom(closest);
  const servings = Math.min(2, Math.max(0.5, Math.round((budget / main.calories) * 2) / 2));
  const entries = [{ meal: main._id, servings }];

  const remaining = budget - main.calories * servings;
  if (remaining >= 120) {
    const side = candidates
      .filter((m) => !m._id.equals(main._id) && m.calories <= remaining * 1.15)
      .sort((a, b) => b.calories - a.calories)[0];
    if (side) entries.push({ meal: side._id, servings: 1 });
  }
  return entries;
}

/**
 * Builds a personalised day plan from the meal catalog using the profile's
 * calorie target, dietary preference and allergies.
 */
export async function generatePlanEntries(profile, user) {
  const meals = await Meal.find({
    ...visibleMealsFilter(user),
    ...compatibilityFilter(profile),
  }).lean();

  const safeMeals = meals.filter((meal) => !containsAllergy(meal, profile.allergies));

  const slots = {};
  for (const slot of MEAL_SLOTS) {
    const budget = profile.calorieTarget * SLOT_SPLIT[slot];
    const candidates = safeMeals.filter((m) => m.category === slot);
    slots[slot] = chooseForSlot(candidates, budget);
  }

  if (MEAL_SLOTS.every((slot) => !slots[slot].length)) {
    throw new AppError(
      'No meals match your dietary preference and allergies yet. Add some custom meals first.',
      422
    );
  }
  return slots;
}
