import mongoose from 'mongoose';
import { DIETARY_TYPES, MEAL_SLOTS } from '../utils/constants.js';

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Meal name is required'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    category: { type: String, enum: MEAL_SLOTS, required: true },
    calories: { type: Number, required: true, min: 0, max: 3000 },
    protein: { type: Number, required: true, min: 0, max: 300 }, // grams
    carbohydrates: { type: Number, required: true, min: 0, max: 400 }, // grams
    fats: { type: Number, required: true, min: 0, max: 300 }, // grams
    ingredients: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    dietaryType: { type: String, enum: DIETARY_TYPES, required: true },
    allergens: { type: [{ type: String, trim: true, lowercase: true }], default: [] },
    servingSize: { type: String, trim: true, maxlength: 40, default: '1 serving' },

    // Catalog meals (isCustom: false) are managed by admins and visible to everyone.
    // Custom meals are private to the user who created them.
    isCustom: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

mealSchema.index({ category: 1, dietaryType: 1 });
mealSchema.index({ isCustom: 1, createdBy: 1 });
mealSchema.index({ name: 'text', ingredients: 'text' });

export const Meal = mongoose.model('Meal', mealSchema);
