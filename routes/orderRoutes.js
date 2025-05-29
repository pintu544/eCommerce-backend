const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', orderController.createOrder);

// Get order by order number
router.get('/:orderNumber', orderController.getOrderByNumber);

module.exports = router;
