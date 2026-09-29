export const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / prefer not to say' },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1–3 days a week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3–5 days a week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6–7 days a week' },
];

export const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', description: 'Gentle deficit of ~500 kcal/day' },
  { value: 'maintenance', label: 'Maintenance', description: 'Maintain your current weight' },
  { value: 'weight_gain', label: 'Weight Gain', description: 'Moderate surplus of ~400 kcal/day' },
];

export const DIETARY_TYPES = [
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat, fish or eggs' },
  { value: 'vegan', label: 'Vegan', description: 'Plant-based only' },
  { value: 'eggetarian', label: 'Eggetarian', description: 'Vegetarian plus eggs' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', description: 'Includes meat and fish' },
];

export const ALLERGENS = ['dairy', 'eggs', 'gluten', 'nuts', 'peanuts', 'soy', 'fish', 'shellfish', 'sesame'];

export const MEAL_SLOTS = [
  { value: 'breakfast', label: 'Breakfast', share: 0.25 },
  { value: 'lunch', label: 'Lunch', share: 0.35 },
  { value: 'snacks', label: 'Snacks', share: 0.1 },
  { value: 'dinner', label: 'Dinner', share: 0.3 },
];

export const MEAL_SORTS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'calories_asc', label: 'Calories: low to high' },
  { value: 'calories_desc', label: 'Calories: high to low' },
  { value: 'protein_desc', label: 'Protein: high to low' },
  { value: 'newest', label: 'Recently added' },
];

// Protein = pink, carbs = yellow, fat = purple (see utils/theme.js).
export const MACRO_COLORS = {
  protein: '#F472B6',
  carbohydrates: '#F5B638',
  fats: '#8B5CF6',
};

export const DISCLAIMER =
  'NutriPlan is for general wellness and planning only. It is not a substitute for professional medical or dietary advice.';

/** Looks up the display label for an option value. */
export const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? value ?? '—';
