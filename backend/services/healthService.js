import { round } from '../utils/helpers.js';

/**
 * General-wellness estimates only — not medical advice.
 * Formulas are documented in the README ("Calorie Calculation").
 */

export const ACTIVITY_MULTIPLIERS = Object.freeze({
  sedentary: 1.2, // little or no exercise
  light: 1.375, // light exercise 1–3 days/week
  moderate: 1.55, // moderate exercise 3–5 days/week
  very_active: 1.725, // hard exercise 6–7 days/week
});

// Daily kcal adjustment applied to maintenance calories for each goal.
export const GOAL_ADJUSTMENTS = Object.freeze({
  weight_loss: -500,
  maintenance: 0,
  weight_gain: 400,
});

// Never recommend a target below this general-population floor.
export const MIN_CALORIE_TARGET = 1200;

// Macro split of the calorie target (protein & carbs = 4 kcal/g, fat = 9 kcal/g).
export const MACRO_SPLIT = Object.freeze({ protein: 0.25, carbohydrates: 0.5, fats: 0.25 });

/** BMI = weight (kg) / height (m)² */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return round(weightKg / (heightM * heightM), 1);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Mifflin-St Jeor BMR:
 *   male:   10w + 6.25h − 5a + 5
 *   female: 10w + 6.25h − 5a − 161
 *   other:  average of both constants (−78)
 */
export function calculateBMR({ weight, height, age, gender }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const constant = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  return Math.round(base + constant);
}

export function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary));
}

export function calculateCalorieTarget(tdee, goal) {
  const target = tdee + (GOAL_ADJUSTMENTS[goal] ?? 0);
  // Round to the nearest 10 kcal — false precision helps nobody.
  return Math.max(MIN_CALORIE_TARGET, Math.round(target / 10) * 10);
}

export function calculateMacroTargets(calories) {
  return {
    protein: Math.round((calories * MACRO_SPLIT.protein) / 4),
    carbohydrates: Math.round((calories * MACRO_SPLIT.carbohydrates) / 4),
    fats: Math.round((calories * MACRO_SPLIT.fats) / 9),
  };
}

/** Computes every derived metric for a profile in one place. */
export function computeMetrics({ weight, height, age, gender, activityLevel, goal }) {
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR({ weight, height, age, gender });
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);
  return {
    bmi,
    bmiCategory: getBMICategory(bmi),
    bmr,
    tdee,
    calorieTarget,
    macroTargets: calculateMacroTargets(calorieTarget),
  };
}
