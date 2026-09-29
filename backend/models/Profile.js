import mongoose from 'mongoose';
import { ACTIVITY_LEVELS, DIETARY_TYPES, GENDERS, GOALS } from '../utils/constants.js';
import { computeMetrics } from '../services/healthService.js';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user (1:1)
    },
    age: { type: Number, required: true, min: 13, max: 100 },
    gender: { type: String, enum: GENDERS, required: true },
    height: { type: Number, required: true, min: 100, max: 250 }, // cm
    weight: { type: Number, required: true, min: 30, max: 300 }, // kg
    targetWeight: { type: Number, min: 30, max: 300 },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS, required: true },
    goal: { type: String, enum: GOALS, required: true },
    dietaryPreference: { type: String, enum: DIETARY_TYPES, required: true },
    allergies: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      default: [],
    },

    // Derived metrics — recalculated automatically before every save.
    bmi: Number,
    bmiCategory: String,
    bmr: Number,
    tdee: Number,
    calorieTarget: Number,
    macroTargets: {
      protein: Number,
      carbohydrates: Number,
      fats: Number,
    },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

profileSchema.pre('save', function updateMetrics() {
  Object.assign(this, computeMetrics(this));
  this.allergies = [...new Set(this.allergies.filter(Boolean))];
});

export const Profile = mongoose.model('Profile', profileSchema);
