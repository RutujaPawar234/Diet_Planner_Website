import { Profile } from '../models/Profile.js';
import { Progress } from '../models/Progress.js';

/**
 * Keeps the profile's current weight in sync with the most recent progress
 * check-in, so BMI and calorie targets always reflect the latest weight.
 */
export async function syncWeightFromProgress(userId) {
  const [latest, profile] = await Promise.all([
    Progress.findOne({ user: userId }).sort({ date: -1 }),
    Profile.findOne({ user: userId }),
  ]);
  if (!latest || !profile || profile.weight === latest.weight) return profile;

  profile.weight = latest.weight;
  await profile.save(); // pre-save hook recalculates BMI, BMR, TDEE and targets
  return profile;
}
