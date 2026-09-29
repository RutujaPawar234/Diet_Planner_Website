/**
 * End-to-end API tests against a real MongoDB test database.
 * Uses MONGODB_URI_TEST if set, otherwise a local "nutriplan_test" database.
 *   npm test
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-for-automated-tests-only';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/nutriplan_test';

const { default: request } = await import('supertest');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../app.js');
const { connectDB } = await import('../config/db.js');
const { Meal, User } = await import('../models/index.js');
const { meals } = await import('../data/meals.js');

const api = request(app);
const today = new Date().toISOString().slice(0, 10);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

let userToken;
let otherToken;
let adminToken;

before(async () => {
  await connectDB(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));

  const admin = await User.create({ name: 'Admin', email: 'admin@test.dev', password: 'Admin12345', role: 'admin' });
  await Meal.insertMany(meals.map((m) => ({ ...m, createdBy: admin._id })));
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Authentication', () => {
  test('registers a user (201) without exposing the password', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'asha@test.dev', password: 'Secret123', role: 'admin' });
    assert.equal(res.status, 201);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.password, undefined);
    assert.equal(res.body.data.user.role, 'user', 'role from body must be ignored');
    assert.equal(res.body.data.hasProfile, false);
    userToken = res.body.data.token;
  });

  test('stores a bcrypt hash, not the plain password', async () => {
    const user = await User.findOne({ email: 'asha@test.dev' }).select('+password');
    assert.notEqual(user.password, 'Secret123');
    assert.match(user.password, /^\$2[aby]\$/);
  });

  test('rejects duplicate email (409) and weak password (422)', async () => {
    const dup = await api.post('/api/auth/register').send({ name: 'Asha', email: 'asha@test.dev', password: 'Secret123' });
    assert.equal(dup.status, 409);
    const weak = await api.post('/api/auth/register').send({ name: 'Bo', email: 'bo@test.dev', password: 'short' });
    assert.equal(weak.status, 422);
    assert.ok(weak.body.details.length);
  });

  test('logs in with correct password and rejects a wrong one (401)', async () => {
    const ok = await api.post('/api/auth/login').send({ email: 'ASHA@test.dev', password: 'Secret123' });
    assert.equal(ok.status, 200);
    const bad = await api.post('/api/auth/login').send({ email: 'asha@test.dev', password: 'Wrong1234' });
    assert.equal(bad.status, 401);

    const admin = await api.post('/api/auth/login').send({ email: 'admin@test.dev', password: 'Admin12345' });
    adminToken = admin.body.data.token;
    const other = await api.post('/api/auth/register').send({ name: 'Ravi', email: 'ravi@test.dev', password: 'Secret123' });
    otherToken = other.body.data.token;
  });

  test('protects routes: missing / invalid token → 401', async () => {
    assert.equal((await api.get('/api/profile')).status, 401);
    assert.equal((await api.get('/api/profile').set(auth('not.a.jwt'))).status, 401);
    const me = await api.get('/api/auth/me').set(auth(userToken));
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, 'asha@test.dev');
  });
});

describe('Profile & metrics', () => {
  test('returns 404 before onboarding', async () => {
    assert.equal((await api.get('/api/profile').set(auth(userToken))).status, 404);
  });

  test('creates profile with BMI / BMR / calorie target (201)', async () => {
    const res = await api.put('/api/profile').set(auth(userToken)).send({
      age: 25,
      gender: 'female',
      height: 165,
      weight: 60,
      activityLevel: 'moderate',
      goal: 'weight_loss',
      dietaryPreference: 'vegetarian',
      allergies: ['Peanuts'],
    });
    assert.equal(res.status, 201);
    const p = res.body.data.profile;
    assert.equal(p.bmi, 22);
    assert.equal(p.bmiCategory, 'Normal');
    // Mifflin-St Jeor: 10*60 + 6.25*165 - 5*25 - 161 = 1345.25 → 1345; ×1.55 = 2085; −500 → 1590
    assert.equal(p.bmr, 1345);
    assert.equal(p.tdee, 2085);
    assert.equal(p.calorieTarget, 1590);
    assert.deepEqual(p.allergies, ['peanuts']);
  });

  test('updates profile and recalculates (200); invalid data → 422', async () => {
    const res = await api.put('/api/profile').set(auth(userToken)).send({
      age: 25, gender: 'female', height: 165, weight: 62, activityLevel: 'moderate', goal: 'maintenance', dietaryPreference: 'vegetarian',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.profile.calorieTarget, 2120);
    const bad = await api.put('/api/profile').set(auth(userToken)).send({ age: 5 });
    assert.equal(bad.status, 422);
  });
});

describe('Meals', () => {
  let customMealId;

  test('lists and filters meals', async () => {
    const res = await api.get('/api/meals?category=breakfast&sort=calories_asc').set(auth(userToken));
    assert.equal(res.status, 200);
    const list = res.body.data.meals;
    assert.ok(list.length > 0);
    assert.ok(list.every((m) => m.category === 'breakfast'));
    assert.ok(list.every((m, i) => i === 0 || list[i - 1].calories <= m.calories));

    const compatible = await api.get('/api/meals?compatible=true').set(auth(userToken));
    assert.ok(compatible.body.data.meals.every((m) => ['vegan', 'vegetarian'].includes(m.dietaryType)));
    assert.ok(compatible.body.data.meals.every((m) => !m.allergens.includes('peanuts')));
  });

  test('user creates, edits and deletes a custom meal', async () => {
    const created = await api.post('/api/meals').set(auth(userToken)).send({
      name: 'My Smoothie', category: 'snacks', calories: 210, protein: 8, carbohydrates: 35, fats: 4, dietaryType: 'vegan', ingredients: ['banana', 'oat milk'],
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.meal.isCustom, true);
    customMealId = created.body.data.meal._id;

    const updated = await api.put(`/api/meals/${customMealId}`).set(auth(userToken)).send({ calories: 230 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.meal.calories, 230);
  });

  test('other users cannot see or change a private custom meal', async () => {
    assert.equal((await api.get(`/api/meals/${customMealId}`).set(auth(otherToken))).status, 404);
    assert.equal((await api.delete(`/api/meals/${customMealId}`).set(auth(otherToken))).status, 404);
  });

  test('normal user cannot edit catalog meals (403); admin can', async () => {
    const catalogMeal = await Meal.findOne({ isCustom: false });
    const denied = await api.put(`/api/meals/${catalogMeal._id}`).set(auth(userToken)).send({ calories: 1 });
    assert.equal(denied.status, 403);
    const allowed = await api.put(`/api/meals/${catalogMeal._id}`).set(auth(adminToken)).send({ calories: catalogMeal.calories + 1 });
    assert.equal(allowed.status, 200);
  });

  test('invalid id → 422, deleting own meal → 200', async () => {
    assert.equal((await api.get('/api/meals/123').set(auth(userToken))).status, 422);
    assert.equal((await api.delete(`/api/meals/${customMealId}`).set(auth(userToken))).status, 200);
  });
});

describe('Diet plans', () => {
  let planId;

  test('returns null when no plan exists for a date', async () => {
    const res = await api.get(`/api/diet-plans/date/${today}`).set(auth(userToken));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.plan, null);
  });

  test('generates a personalised plan that respects diet & allergies', async () => {
    const res = await api.post('/api/diet-plans/generate').set(auth(userToken)).send({ date: today });
    assert.equal(res.status, 201);
    const plan = res.body.data.plan;
    planId = plan._id;
    assert.ok(plan.totalCalories > 0);
    const entries = ['breakfast', 'lunch', 'snacks', 'dinner'].flatMap((s) => plan[s]);
    assert.ok(entries.length >= 4);
    assert.ok(entries.every((e) => ['vegan', 'vegetarian'].includes(e.meal.dietaryType)));
    assert.ok(entries.every((e) => !e.meal.allergens.includes('peanuts')));
  });

  test('adds, updates (consumed) and removes an entry with recalculated totals', async () => {
    const meal = await Meal.findOne({ category: 'snacks', dietaryType: 'vegan', allergens: [] });
    const added = await api.post(`/api/diet-plans/${planId}/entries`).set(auth(userToken)).send({ slot: 'snacks', meal: meal._id, servings: 2 });
    assert.equal(added.status, 201);
    const entry = added.body.data.plan.snacks.at(-1);

    const consumed = await api.patch(`/api/diet-plans/${planId}/entries/${entry._id}`).set(auth(userToken)).send({ consumed: true });
    assert.equal(consumed.status, 200);
    assert.equal(consumed.body.data.plan.consumedCalories, meal.calories * 2);

    const removed = await api.delete(`/api/diet-plans/${planId}/entries/${entry._id}`).set(auth(userToken));
    assert.equal(removed.status, 200);
    assert.equal(removed.body.data.plan.consumedCalories, 0);
  });

  test('duplicate plan for the same date → 409; other user → 404', async () => {
    assert.equal((await api.post('/api/diet-plans').set(auth(userToken)).send({ date: today })).status, 409);
    assert.equal((await api.get(`/api/diet-plans/${planId}`).set(auth(otherToken))).status, 404);
  });

  test('dashboard aggregates today', async () => {
    const res = await api.get(`/api/dashboard?date=${today}`).set(auth(userToken));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.calories.target, 2120);
    assert.equal(res.body.data.week.length, 7);
    assert.ok(res.body.data.plan);
  });

  test('deletes a plan', async () => {
    assert.equal((await api.delete(`/api/diet-plans/${planId}`).set(auth(userToken))).status, 200);
  });
});

describe('Progress', () => {
  let entryId;

  test('logs progress and syncs profile weight', async () => {
    const res = await api.post('/api/progress').set(auth(userToken)).send({ date: today, weight: 61.2, caloriesConsumed: 1800, notes: 'Good day' });
    assert.equal(res.status, 201);
    entryId = res.body.data.entry._id;
    assert.equal(res.body.data.profile.weight, 61.2);
  });

  test('lists, rejects duplicates, updates and deletes', async () => {
    const list = await api.get('/api/progress').set(auth(userToken));
    assert.equal(list.body.data.entries.length, 1);
    assert.equal(list.body.data.entries[0].date, today);

    assert.equal((await api.post('/api/progress').set(auth(userToken)).send({ date: today, weight: 61 })).status, 409);
    const updated = await api.put(`/api/progress/${entryId}`).set(auth(userToken)).send({ weight: 60.8 });
    assert.equal(updated.body.data.entry.weight, 60.8);
    assert.equal((await api.delete(`/api/progress/${entryId}`).set(auth(otherToken))).status, 404);
    assert.equal((await api.delete(`/api/progress/${entryId}`).set(auth(userToken))).status, 200);
  });
});

describe('Admin authorization', () => {
  test('normal user cannot access admin APIs (403)', async () => {
    assert.equal((await api.get('/api/users').set(auth(userToken))).status, 403);
    assert.equal((await api.get('/api/dashboard/admin').set(auth(userToken))).status, 403);
  });

  test('admin can view stats and users', async () => {
    const stats = await api.get('/api/dashboard/admin').set(auth(adminToken));
    assert.equal(stats.status, 200);
    assert.equal(stats.body.data.totals.users, 3);
    const users = await api.get('/api/users').set(auth(adminToken));
    assert.equal(users.body.data.users.length, 3);
    assert.ok(users.body.data.users.every((u) => u.password === undefined));
  });

  test('unknown route → 404 JSON', async () => {
    const res = await api.get('/api/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
