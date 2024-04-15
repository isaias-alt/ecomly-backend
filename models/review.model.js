const { Schema, model } = require('mongoose');

const reviewSchema = Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, trim: true },
  rating: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

cartProductoSchema.set('toObject', { virtuals: true });
cartProductoSchema.set('toJSON', { virtuals: true });

exports.Review = model('Review', reviewSchema);