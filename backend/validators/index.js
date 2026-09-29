import { body, param, query } from 'express-validator';
import {
  ACTIVITY_LEVELS,
  DIETARY_TYPES,
  GENDERS,
  GOALS,
  MEAL_SLOTS,
  ROLES,
} from '../utils/constants.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ---------- shared ---------- */

export const idParam = (name = 'id') => param(name).isMongoId().withMessage(`Invalid ${name}`);

const dateField = (field, location = body) =>
  location(field).matches(DATE_RE).withMessage(`${field} must be a date in YYYY-MM-DD format`);

const stringArray = (field, maxItems, maxLength) =>
  body(field)
    .optional()
    .isArray({ max: maxItems })
    .withMessage(`${field} must be a list of at most ${maxItems} items`)
    .bail()
    .custom((arr) => arr.every((v) => typeof v === 'string' && v.trim().length <= maxLength))
    .withMessage(`Each item in ${field} must be text of at most ${maxLength} characters`);

/* ---------- auth ---------- */

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

export const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/* ---------- users ---------- */

export const updateMeRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
];

export const updateRoleRules = [
  idParam(),
  body('role').isIn(Object.values(ROLES)).withMessage('Role must be user or admin'),
];

/* ---------- profile ---------- */

export const profileRules = [
  body('age').isInt({ min: 13, max: 100 }).withMessage('Age must be between 13 and 100').toInt(),
  body('gender').isIn(GENDERS).withMessage('Invalid gender'),
  body('height').isFloat({ min: 100, max: 250 }).withMessage('Height must be 100–250 cm').toFloat(),
  body('weight').isFloat({ min: 30, max: 300 }).withMessage('Weight must be 30–300 kg').toFloat(),
  body('targetWeight')
    .optional({ values: 'falsy' })
    .isFloat({ min: 30, max: 300 })
    .withMessage('Target weight must be 30–300 kg')
    .toFloat(),
  body('activityLevel').isIn(ACTIVITY_LEVELS).withMessage('Invalid activity level'),
  body('goal').isIn(GOALS).withMessage('Invalid goal'),
  body('dietaryPreference').isIn(DIETARY_TYPES).withMessage('Invalid dietary preference'),
  stringArray('allergies', 20, 30),
];

/* ---------- meals ---------- */

export const mealRules = (isUpdate = false) => {
  const maybe = (chain) => (isUpdate ? chain.optional() : chain);
  const macro = (field, max) =>
    maybe(body(field))
      .isFloat({ min: 0, max })
      .withMessage(`${field} must be a number between 0 and ${max}`)
      .toFloat();

  return [
    ...(isUpdate ? [idParam()] : []),
    maybe(body('name')).trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
    maybe(body('category')).isIn(MEAL_SLOTS).withMessage('Invalid meal category'),
    maybe(body('dietaryType')).isIn(DIETARY_TYPES).withMessage('Invalid dietary type'),
    macro('calories', 3000),
    macro('protein', 300),
    macro('carbohydrates', 400),
    macro('fats', 300),
    body('description').optional().isString().trim().isLength({ max: 300 }),
    body('servingSize').optional().isString().trim().isLength({ max: 40 }),
    stringArray('ingredients', 30, 60),
    stringArray('allergens', 15, 30),
  ];
};

export const mealQueryRules = [
  query('category').optional().isIn(MEAL_SLOTS).withMessage('Invalid category'),
  query('dietaryType').optional().isIn(DIETARY_TYPES).withMessage('Invalid dietary type'),
  query('sort')
    .optional()
    .isIn(['name', 'calories_asc', 'calories_desc', 'protein_desc', 'newest'])
    .withMessage('Invalid sort option'),
  query('scope').optional().isIn(['all', 'custom', 'catalog']).withMessage('Invalid scope'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 80 }),
];

/* ---------- diet plans ---------- */

const entryArray = (slot) =>
  body(slot)
    .optional()
    .isArray({ max: 12 })
    .withMessage(`${slot} must be a list`)
    .bail()
    .custom((entries) =>
      entries.every(
        (e) =>
          e &&
          /^[a-f\d]{24}$/i.test(String(e.meal)) &&
          (e.servings === undefined || (Number(e.servings) >= 0.25 && Number(e.servings) <= 10))
      )
    )
    .withMessage(`Each ${slot} entry needs a valid meal id and servings between 0.25 and 10`);

export const createPlanRules = [
  dateField('date'),
  ...MEAL_SLOTS.map(entryArray),
  body('notes').optional().isString().isLength({ max: 500 }),
];

export const updatePlanRules = [
  idParam(),
  ...MEAL_SLOTS.map(entryArray),
  body('notes').optional().isString().isLength({ max: 500 }),
];

export const generatePlanRules = [dateField('date')];

export const planDateRules = [dateField('date', param)];

export const planListRules = [
  query('from').optional().matches(DATE_RE).withMessage('from must be YYYY-MM-DD'),
  query('to').optional().matches(DATE_RE).withMessage('to must be YYYY-MM-DD'),
];

export const addEntryRules = [
  idParam(),
  body('slot').isIn(MEAL_SLOTS).withMessage('Invalid meal slot'),
  body('meal').isMongoId().withMessage('Invalid meal id'),
  body('servings').optional().isFloat({ min: 0.25, max: 10 }).withMessage('Servings must be 0.25–10').toFloat(),
];

export const updateEntryRules = [
  idParam(),
  idParam('entryId'),
  body('servings').optional().isFloat({ min: 0.25, max: 10 }).withMessage('Servings must be 0.25–10').toFloat(),
  body('consumed').optional().isBoolean().withMessage('consumed must be true or false').toBoolean(),
  body('slot').optional().isIn(MEAL_SLOTS).withMessage('Invalid meal slot'),
];

export const entryParamRules = [idParam(), idParam('entryId')];

/* ---------- progress ---------- */

export const progressRules = (isUpdate = false) => [
  ...(isUpdate ? [idParam()] : [dateField('date')]),
  (isUpdate ? body('weight').optional() : body('weight'))
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be 30–300 kg')
    .toFloat(),
  body('caloriesConsumed')
    .optional({ values: 'null' })
    .isInt({ min: 0, max: 10000 })
    .withMessage('Calories must be 0–10000')
    .toInt(),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
];

export const dashboardRules = [
  query('date').optional().matches(DATE_RE).withMessage('date must be YYYY-MM-DD'),
];
