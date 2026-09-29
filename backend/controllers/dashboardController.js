import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Meal } from '../models/Meal.js';
import { DietPlan } from '../models/DietPlan.js';
import { Progress } from '../models/Progress.js';
import { sendSuccess, round } from '../utils/helpers.js';
import { addDays, todayISO, toDateOnly, toISODate } from '../utils/date.js';
import { preparePlan } from '../services/dietPlanService.js';

// GET /api/dashboard?date=YYYY-MM-DD — everything the user dashboard needs in one request
export async function getDashboard(req, res) {
  const userId = req.user._id;
  const date = toDateOnly(req.query.date || todayISO());
  const weekStart = addDays(date, -6);

  const [profile, todayPlan, progress, weekPlans] = await Promise.all([
    Profile.findOne({ user: userId }),
    DietPlan.findOne({ user: userId, date }),
    Progress.find({ user: userId }).sort({ date: 1 }).select('date weight caloriesConsumed'),
    DietPlan.find({ user: userId, date: { $gte: weekStart, $lte: date } }).select(
      'date totalCalories consumedCalories'
    ),
  ]);

  const plan = await preparePlan(todayPlan);
  const target = profile?.calorieTarget || 0;
  const consumed = plan?.consumedCalories || 0;

  // Last 7 days of planned vs consumed calories (zero-filled for missing days).
  const byDate = new Map(weekPlans.map((p) => [toISODate(p.date), p]));
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = toISODate(addDays(weekStart, i));
    const p = byDate.get(day);
    return { date: day, planned: p?.totalCalories || 0, consumed: p?.consumedCalories || 0, target };
  });

  const first = progress[0];
  const latest = progress[progress.length - 1];

  sendSuccess(res, {
    date: toISODate(date),
    profile,
    calories: {
      target,
      planned: plan?.totalCalories || 0,
      consumed,
      remaining: Math.max(0, target - consumed),
    },
    plan,
    progress: {
      entries: progress.slice(-14),
      totalEntries: progress.length,
      startWeight: first?.weight ?? profile?.weight ?? null,
      currentWeight: latest?.weight ?? profile?.weight ?? null,
      change: first && latest ? round(latest.weight - first.weight, 1) : 0,
    },
    week,
  });
}

// GET /api/dashboard/admin — application statistics (admin only)
export async function getAdminStats(_req, res) {
  const since = addDays(new Date(), -7);

  const [users, admins, newUsers, profiles, catalogMeals, customMeals, plans, progressEntries, byCategory, byDiet, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: since } }),
      Profile.countDocuments(),
      Meal.countDocuments({ isCustom: false }),
      Meal.countDocuments({ isCustom: true }),
      DietPlan.countDocuments(),
      Progress.countDocuments(),
      Meal.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, avgCalories: { $avg: '$calories' } } }]),
      Profile.aggregate([{ $group: { _id: '$dietaryPreference', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5),
    ]);

  sendSuccess(res, {
    totals: { users, admins, newUsers, profiles, catalogMeals, customMeals, plans, progressEntries },
    mealsByCategory: byCategory.map((c) => ({
      category: c._id,
      count: c.count,
      avgCalories: Math.round(c.avgCalories),
    })),
    usersByDiet: byDiet.map((d) => ({ dietaryPreference: d._id, count: d.count })),
    recentUsers,
  });
}
