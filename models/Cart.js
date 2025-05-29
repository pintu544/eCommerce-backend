const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  variant: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    default: 85.00, // Default price fallback
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    default: function() {
      return this.price * this.quantity;
    },
    min: 0
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
