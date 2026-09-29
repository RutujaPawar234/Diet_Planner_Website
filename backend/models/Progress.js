import mongoose from 'mongoose';
import { toISODate } from '../utils/date.js';

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true, min: 30, max: 300 },
    caloriesConsumed: { type: Number, min: 0, max: 10000, default: 0 },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
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

// One check-in per user per day, queried in date order.
progressSchema.index({ user: 1, date: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
