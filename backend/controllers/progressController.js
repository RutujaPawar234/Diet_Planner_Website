import { Progress } from '../models/Progress.js';
import { AppError } from '../utils/AppError.js';
import { pick, sendSuccess } from '../utils/helpers.js';
import { toDateOnly } from '../utils/date.js';
import { syncWeightFromProgress } from '../services/profileService.js';

async function findOwnEntry(id, user) {
  const entry = await Progress.findOne({ _id: id, user: user._id });
  if (!entry) throw new AppError('Progress entry not found', 404);
  return entry;
}

// GET /api/progress?from=&to= — oldest first, ready for charting
export async function getProgress(req, res) {
  const filter = { user: req.user._id };
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = toDateOnly(req.query.from);
    if (req.query.to) filter.date.$lte = toDateOnly(req.query.to);
  }
  const entries = await Progress.find(filter).sort({ date: 1 }).limit(366);
  sendSuccess(res, { entries });
}

// POST /api/progress
export async function createProgress(req, res) {
  const date = toDateOnly(req.body.date);
  if (await Progress.exists({ user: req.user._id, date })) {
    throw new AppError('You already logged progress for this date. Edit that entry instead.', 409);
  }
  const entry = await Progress.create({
    user: req.user._id,
    date,
    ...pick(req.body, ['weight', 'caloriesConsumed', 'notes']),
  });
  const profile = await syncWeightFromProgress(req.user._id);
  sendSuccess(res, { entry, profile }, 201, 'Progress logged');
}

// PUT /api/progress/:id
export async function updateProgress(req, res) {
  const entry = await findOwnEntry(req.params.id, req.user);
  entry.set(pick(req.body, ['weight', 'caloriesConsumed', 'notes']));
  await entry.save();
  const profile = await syncWeightFromProgress(req.user._id);
  sendSuccess(res, { entry, profile }, 200, 'Progress updated');
}

// DELETE /api/progress/:id
export async function deleteProgress(req, res) {
  const entry = await findOwnEntry(req.params.id, req.user);
  await entry.deleteOne();
  const profile = await syncWeightFromProgress(req.user._id);
  sendSuccess(res, { profile }, 200, 'Progress entry deleted');
}
