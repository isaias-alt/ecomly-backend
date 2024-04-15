const { Schema, model } = require('mongoose');

const cartSchema = Schema({
  cartItems: [{ type: Schema.Types.ObjectId, ref: 'CartProducto', required: true }],
  totalPrice: Number,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  dateCreated: { type: Date, default: Date.now }
});

cartSchema.set('toObject', { virtuals: true });
cartSchema.set('toJSON', { virtuals: true });

exports.Cart = model('Cart', cartSchema);
