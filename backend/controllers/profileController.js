import { Profile } from '../models/Profile.js';
import { AppError } from '../utils/AppError.js';
import { pick, sendSuccess } from '../utils/helpers.js';

const EDITABLE_FIELDS = [
  'age',
  'gender',
  'height',
  'weight',
  'targetWeight',
  'activityLevel',
  'goal',
  'dietaryPreference',
  'allergies',
];

// GET /api/profile
export async function getProfile(req, res) {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Profile not found. Please complete onboarding.', 404);
  sendSuccess(res, { profile });
}

// PUT /api/profile — creates the profile on first call (onboarding), updates afterwards.
export async function upsertProfile(req, res) {
  let profile = await Profile.findOne({ user: req.user._id });
  const isNew = !profile;
  if (isNew) profile = new Profile({ user: req.user._id });

  const updates = pick(req.body, EDITABLE_FIELDS);
  if (Array.isArray(updates.allergies)) {
    updates.allergies = updates.allergies.map((a) => a.trim().toLowerCase()).filter(Boolean);
  }
  profile.set(updates);
  await profile.save(); // pre-save hook recalculates BMI / BMR / TDEE / calorie target

  sendSuccess(res, { profile }, isNew ? 201 : 200, isNew ? 'Profile created' : 'Profile updated');
}
