import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 0, max: 6 },
  meal: { type: String, required: true, enum: ['midi', 'soir'] },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
});

const planSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  entries: { type: [entrySchema], default: [] },
}, { timestamps: true });

planSchema.index({ owner: 1, weekStart: 1 }, { unique: true });

export default mongoose.model('Plan', planSchema);