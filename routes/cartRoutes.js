const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get cart by userId
router.get('/:userId', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/items/:itemId', cartController.removeCartItem);

// Clear cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;
