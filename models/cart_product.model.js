const { Schema, model } = require('mongoose');

const cartProductoSchema = Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  selectedSize: String,
  selectedColour: String,
  reservationExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000),
  },
  reserved: { type: Boolean, default: true },
});

cartProductoSchema.set('toObject', { virtuals: true });
cartProductoSchema.set('toJSON', { virtuals: true });

exports.CartProducto = model('CartProducto', cartProductoSchema);
