export const ROLES = Object.freeze({ USER: 'user', ADMIN: 'admin' });

export const GENDERS = ['male', 'female', 'other'];

export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very_active'];

export const GOALS = ['weight_loss', 'maintenance', 'weight_gain'];

export const DIETARY_TYPES = ['vegan', 'vegetarian', 'eggetarian', 'non_vegetarian'];

export const MEAL_SLOTS = ['breakfast', 'lunch', 'snacks', 'dinner'];

export const COMMON_ALLERGENS = [
  'dairy',
  'eggs',
  'gluten',
  'nuts',
  'peanuts',
  'soy',
  'fish',
  'shellfish',
  'sesame',
];

/**
 * Which meal dietary types each preference can eat.
 * e.g. an eggetarian can eat vegan, vegetarian and egg-based dishes.
 */
export const COMPATIBLE_DIETARY_TYPES = Object.freeze({
  vegan: ['vegan'],
  vegetarian: ['vegan', 'vegetarian'],
  eggetarian: ['vegan', 'vegetarian', 'eggetarian'],
  non_vegetarian: DIETARY_TYPES,
});
