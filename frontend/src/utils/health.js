/**
 * Client-side mirror of backend/services/healthService.js, used only for the
 * instant preview in the calculator and onboarding. Saved values always come
 * from the API, which is the source of truth.
 */
export const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725 };
export const GOAL_ADJUSTMENTS = { weight_loss: -500, maintenance: 0, weight_gain: 400 };
export const MIN_CALORIE_TARGET = 1200;

export function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const m = height / 100;
  return Math.round((weight / (m * m)) * 10) / 10;
}

export const BMI_RANGES = [
  { max: 18.5, label: 'Underweight', tone: 'blue' },
  { max: 25, label: 'Normal', tone: 'success' },
  { max: 30, label: 'Overweight', tone: 'amber' },
  { max: Infinity, label: 'Obese', tone: 'red' },
];

export const bmiInfo = (bmi) => BMI_RANGES.find((r) => bmi < r.max) ?? BMI_RANGES[3];

export function calculateBMR({ weight, height, age, gender }) {
  if (!weight || !height || !age) return null;
  const constant = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  return Math.round(10 * weight + 6.25 * height - 5 * age + constant);
}

export function estimateCalories(profile) {
  const bmr = calculateBMR(profile);
  if (!bmr) return null;
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.2));
  const target = Math.max(MIN_CALORIE_TARGET, Math.round((tdee + (GOAL_ADJUSTMENTS[profile.goal] ?? 0)) / 10) * 10);
  return { bmr, tdee, target };
}
