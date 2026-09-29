import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Meal } from '../models/Meal.js';
import { DietPlan } from '../models/DietPlan.js';
import { Progress } from '../models/Progress.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex, sendSuccess } from '../utils/helpers.js';

// PATCH /api/users/me — update own account details
export async function updateMe(req, res) {
  req.user.name = req.body.name;
  await req.user.save();
  sendSuccess(res, { user: req.user }, 200, 'Account updated');
}

// GET /api/users?search= — admin: list users with their profile summary
export async function getUsers(req, res) {
  const filter = {};
  if (req.query.search) {
    const re = { $regex: escapeRegex(req.query.search), $options: 'i' };
    filter.$or = [{ name: re }, { email: re }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  const profiles = await Profile.find({ user: { $in: users.map((u) => u._id) } })
    .select('user goal dietaryPreference calorieTarget')
    .lean();
  const byUser = new Map(profiles.map((p) => [p.user.toString(), p]));

  sendSuccess(res, {
    users: users.map(({ password: _pw, __v, ...u }) => ({ ...u, profile: byUser.get(u._id.toString()) || null })),
  });
}

// PATCH /api/users/:id/role — admin: promote / demote
export async function updateUserRole(req, res) {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { returnDocument: 'after', runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { user }, 200, 'Role updated');
}

// DELETE /api/users/:id — admin: delete a user and all of their data
export async function deleteUser(req, res) {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account from the admin panel', 400);
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  await Promise.all([
    Profile.deleteMany({ user: user._id }),
    DietPlan.deleteMany({ user: user._id }),
    Progress.deleteMany({ user: user._id }),
    Meal.deleteMany({ createdBy: user._id, isCustom: true }),
  ]);
  await user.deleteOne();
  sendSuccess(res, null, 200, 'User and related data deleted');
}
