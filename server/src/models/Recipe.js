import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['g', 'kg', 'ml', 'cl', 'l', 'piece'] },
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  servings: { type: Number, required: true, min: 1 },
  ingredients: { type: [ingredientSchema], default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Recipe', recipeSchema);