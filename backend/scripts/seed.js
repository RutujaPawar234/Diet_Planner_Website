/**
 * Seeds the database with the meal catalog and an admin account.
 *   npm run seed        → meals + admin
 *   npm run seed:demo   → also a demo user with profile, plans and progress history
 *
 * Safe to re-run: catalog meals and accounts are upserted; the demo user's data is reset.
 */
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { DietPlan, Meal, Profile, Progress, User } from '../models/index.js';
import { meals } from '../data/meals.js';
import { generatePlanEntries, savePlan } from '../services/dietPlanService.js';
import { addDays, localTodayISO, toDateOnly } from '../utils/date.js';

const withDemo = process.argv.includes('--demo');

async function upsertUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) user = new User({ email });
  user.set({ name, password, role });
  await user.save();
  return user;
}

async function seedDemo() {
  const user = await upsertUser({
    name: 'Demo User',
    email: process.env.DEMO_EMAIL || 'demo@nutriplan.app',
    password: process.env.DEMO_PASSWORD || 'Demo@12345',
    role: 'user',
  });

  await Promise.all([
    Profile.deleteMany({ user: user._id }),
    DietPlan.deleteMany({ user: user._id }),
    Progress.deleteMany({ user: user._id }),
  ]);

  const profile = await Profile.create({
    user: user._id,
    age: 26,
    gender: 'female',
    height: 162,
    weight: 68,
    targetWeight: 62,
    activityLevel: 'light',
    goal: 'weight_loss',
    dietaryPreference: 'vegetarian',
    allergies: [],
  });

  // Six weeks of gradual weigh-ins.
  const today = toDateOnly(localTodayISO());
  const entries = Array.from({ length: 7 }, (_, i) => ({
    user: user._id,
    date: addDays(today, -(6 - i) * 7),
    weight: +(71.2 - i * 0.55 + (i % 2 ? 0.15 : 0)).toFixed(1),
    caloriesConsumed: 1500 + ((i * 97) % 250),
    notes: i === 0 ? 'Started NutriPlan' : '',
  }));
  await Progress.insertMany(entries);
  profile.weight = entries.at(-1).weight;
  await profile.save();

  // Plans for the last 7 days, with past meals marked as eaten.
  for (let i = 6; i >= 0; i -= 1) {
    const plan = new DietPlan({ user: user._id, date: addDays(today, -i), generated: true });
    plan.set(await generatePlanEntries(profile, user));
    if (i > 0) {
      for (const slot of ['breakfast', 'lunch', 'snacks', 'dinner']) {
        plan[slot].forEach((entry, idx) => (entry.consumed = (i + idx) % 5 !== 0));
      }
    } else {
      plan.breakfast.forEach((entry) => (entry.consumed = true));
    }
    await savePlan(plan);
  }
  console.log(`Demo user ready: ${user.email}`);
}

async function seed() {
  await connectDB();

  const admin = await upsertUser({
    name: process.env.ADMIN_NAME || 'NutriPlan Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@nutriplan.app').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  });
  console.log(`Admin account ready: ${admin.email}`);

  // Upsert by name so re-seeding keeps meal ids stable (existing plans stay intact).
  const result = await Meal.bulkWrite(
    meals.map((m) => ({
      updateOne: {
        filter: { name: m.name, isCustom: false },
        update: { $set: { ...m, isCustom: false, createdBy: admin._id } },
        upsert: true,
      },
    }))
  );
  console.log(`Catalog meals: ${result.upsertedCount} added, ${result.modifiedCount} updated`);

  if (withDemo) await seedDemo();

  await disconnectDB();
  console.log(`Seeding complete (${env.nodeEnv}).`);
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error);
  await disconnectDB();
  process.exit(1);
});
