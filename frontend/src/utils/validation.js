export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim());

/** Returns an error message for each invalid field, or an empty object. */
export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!isEmail(email)) errors.email = 'Please enter a valid email address';
  if (password.length < 8) errors.password = 'Use at least 8 characters';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Include at least one letter and one number';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isEmail(email)) errors.email = 'Please enter a valid email address';
  if (!password) errors.password = 'Please enter your password';
  return errors;
}

export function validateProfile(p) {
  const errors = {};
  const inRange = (v, min, max) => v !== '' && v != null && Number(v) >= min && Number(v) <= max;
  if (!inRange(p.age, 13, 100)) errors.age = 'Age must be between 13 and 100';
  if (!p.gender) errors.gender = 'Please select an option';
  if (!inRange(p.height, 100, 250)) errors.height = 'Height must be 100–250 cm';
  if (!inRange(p.weight, 30, 300)) errors.weight = 'Weight must be 30–300 kg';
  if (p.targetWeight && !inRange(p.targetWeight, 30, 300)) errors.targetWeight = 'Target must be 30–300 kg';
  if (!p.activityLevel) errors.activityLevel = 'Please select your activity level';
  if (!p.goal) errors.goal = 'Please select a goal';
  if (!p.dietaryPreference) errors.dietaryPreference = 'Please select a dietary preference';
  return errors;
}

/** Maps server-side validation details ([{ field, message }]) onto form fields. */
export const fieldErrorsFrom = (error) =>
  Object.fromEntries((error?.details || []).map((d) => [d.field, d.message]));
