import { Meal } from '../models/Meal.js';
import { DietPlan } from '../models/DietPlan.js';
import { Profile } from '../models/Profile.js';
import { AppError } from '../utils/AppError.js';
import { ROLES, MEAL_SLOTS } from '../utils/constants.js';
import { escapeRegex, pick, sendSuccess } from '../utils/helpers.js';
import { assertCanModify, compatibilityFilter, visibleMealsFilter } from '../services/mealService.js';

const EDITABLE_FIELDS = [
  'name',
  'description',
  'category',
  'calories',
  'protein',
  'carbohydrates',
  'fats',
  'ingredients',
  'dietaryType',
  'allergens',
  'servingSize',
];

const SORTS = {
  name: { name: 1 },
  calories_asc: { calories: 1, name: 1 },
  calories_desc: { calories: -1, name: 1 },
  protein_desc: { protein: -1, name: 1 },
  newest: { createdAt: -1 },
};

// GET /api/meals?search=&category=&dietaryType=&sort=&compatible=true&page=&limit=
export async function getMeals(req, res) {
  const { search, category, dietaryType, sort = 'name', compatible, scope } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;

  const filter = { ...visibleMealsFilter(req.user) };
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;
  if (dietaryType) filter.dietaryType = dietaryType;
  if (scope === 'custom') filter.isCustom = true;
  if (scope === 'catalog') filter.isCustom = false;
  if (compatible === 'true') {
    const profile = await Profile.findOne({ user: req.user._id }).lean();
    Object.assign(filter, compatibilityFilter(profile));
  }

  const [meals, total] = await Promise.all([
    Meal.find(filter)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    Meal.countDocuments(filter),
  ]);

  sendSuccess(res, {
    meals,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
}

// GET /api/meals/:id
export async function getMeal(req, res) {
  const meal = await Meal.findOne({ _id: req.params.id, ...visibleMealsFilter(req.user) });
  if (!meal) throw new AppError('Meal not found', 404);
  sendSuccess(res, { meal });
}

// POST /api/meals — admins add to the shared catalog, users create private custom meals.
export async function createMeal(req, res) {
  const isAdmin = req.user.role === ROLES.ADMIN;
  const meal = await Meal.create({
    ...pick(req.body, EDITABLE_FIELDS),
    isCustom: !isAdmin,
    createdBy: req.user._id,
  });
  sendSuccess(res, { meal }, 201, isAdmin ? 'Meal added to catalog' : 'Custom meal created');
}

// PUT /api/meals/:id
export async function updateMeal(req, res) {
  const meal = await Meal.findOne({ _id: req.params.id, ...visibleMealsFilter(req.user) });
  if (!meal) throw new AppError('Meal not found', 404);
  assertCanModify(meal, req.user);

  meal.set(pick(req.body, EDITABLE_FIELDS));
  await meal.save();
  sendSuccess(res, { meal }, 200, 'Meal updated');
}

// DELETE /api/meals/:id
export async function deleteMeal(req, res) {
  const meal = await Meal.findOne({ _id: req.params.id, ...visibleMealsFilter(req.user) });
  if (!meal) throw new AppError('Meal not found', 404);
  assertCanModify(meal, req.user);

  await meal.deleteOne();
  // Remove the deleted meal from any plans that referenced it.
  const pull = Object.fromEntries(MEAL_SLOTS.map((slot) => [slot, { meal: meal._id }]));
  await DietPlan.updateMany({}, { $pull: pull });

  sendSuccess(res, null, 200, 'Meal deleted');
}
