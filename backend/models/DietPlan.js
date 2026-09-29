import mongoose from 'mongoose';
import { toISODate } from '../utils/date.js';

// One meal placed in a slot of a day's plan.
const planEntrySchema = new mongoose.Schema({
  meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
  servings: { type: Number, min: 0.25, max: 10, default: 1 },
  consumed: { type: Boolean, default: false },
});

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // UTC midnight of the calendar day
    breakfast: { type: [planEntrySchema], default: [] },
    lunch: { type: [planEntrySchema], default: [] },
    snacks: { type: [planEntrySchema], default: [] },
    dinner: { type: [planEntrySchema], default: [] },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    generated: { type: Boolean, default: false },

    // Denormalised totals kept in sync by dietPlanService.applyTotals().
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbohydrates: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    consumedCalories: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.date = toISODate(ret.date);
        return ret;
      },
    },
  }
);

// A user has at most one plan per day; also the main lookup path.
dietPlanSchema.index({ user: 1, date: 1 }, { unique: true });

export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
