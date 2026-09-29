import { Meal } from '../models/Meal.js';
import { AppError } from '../utils/AppError.js';
import { COMPATIBLE_DIETARY_TYPES, ROLES } from '../utils/constants.js';

/** Catalog meals + the user's own custom meals. */
export const visibleMealsFilter = (user) => ({
  $or: [{ isCustom: false }, { createdBy: user._id }],
});

/** Filter that keeps only meals matching a profile's diet and allergies. */
export function compatibilityFilter(profile) {
  if (!profile) return {};
  const filter = { dietaryType: { $in: COMPATIBLE_DIETARY_TYPES[profile.dietaryPreference] } };
  if (profile.allergies?.length) filter.allergens = { $nin: profile.allergies };
  return filter;
}

/** Secondary allergy check against ingredient text (e.g. allergy "peanut" vs "peanut butter"). */
export const containsAllergy = (meal, allergies = []) =>
  allergies.some(
    (allergy) =>
      meal.allergens?.includes(allergy) ||
      meal.ingredients?.some((ing) => ing.toLowerCase().includes(allergy))
  );

/** Users may modify only their own custom meals; admins may modify any meal. */
export function assertCanModify(meal, user) {
  if (user.role === ROLES.ADMIN) return;
  const ownsMeal = meal.isCustom && meal.createdBy?.toString() === user._id.toString();
  if (!ownsMeal) throw new AppError('You can only modify meals you created.', 403);
}

/** Ensures every referenced meal exists and is visible to the user. */
export async function assertMealsAccessible(mealIds, user) {
  const unique = [...new Set(mealIds.map(String))];
  if (!unique.length) return;
  const count = await Meal.countDocuments({ _id: { $in: unique }, ...visibleMealsFilter(user) });
  if (count !== unique.length) throw new AppError('One or more meals were not found.', 404);
}
