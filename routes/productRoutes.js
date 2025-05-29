const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create initial product (for testing)
router.post('/init', productController.createInitialProduct);

module.exports = router;
