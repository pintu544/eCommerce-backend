const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart by userId
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let cart = await Cart.findOne({ userId }).populate('items.product');
    
    if (!cart) {
      // If no cart exists, create an empty one
      cart = new Cart({
        userId,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, variant } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product found for adding to cart:', { 
      id: product._id,
      title: product.title,
      price: product.price,
      inventory: product.inventory
    });
    
    // Ensure product has a valid price
    let productPrice = product.price;
    
    if (productPrice === undefined || productPrice === null || isNaN(productPrice)) {
      console.warn(`Product ${productId} has invalid price: ${productPrice}. Using default price.`);
      // Use default price if price is invalid
      productPrice = 85.00;
      
      // Try to update the product with the default price
      try {
        await Product.updateOne(
          { _id: productId },
          { $set: { price: productPrice } }
        );
        console.log(`Updated product ${productId} with default price: $85.00`);
      } catch (priceUpdateError) {
        console.error('Failed to update product with default price:', priceUpdateError);
        // Continue anyway as we're using the default price
      }
    }
    
    // Parse price to ensure it's a number and has 2 decimal places
    const safePrice = parseFloat(parseFloat(productPrice).toFixed(2));
    
    // Calculate item subtotal (safe calculation)
    const itemSubtotal = parseFloat((safePrice * quantity).toFixed(2));
    
    if (isNaN(itemSubtotal)) {
      console.error('Invalid subtotal calculation:', { 
        productPrice, 
        quantity, 
        result: productPrice * quantity 
      });
      return res.status(500).json({ message: 'Error calculating item subtotal' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        total: 0
      });
    }
    
    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product && item.product.toString() === productId && item.variant === variant
    );
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = safePrice; // Ensure price is updated
      cart.items[itemIndex].subtotal = parseFloat(
        (cart.items[itemIndex].quantity * safePrice).toFixed(2)
      );
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant: variant || '',
        price: safePrice,
        subtotal: itemSubtotal
      });
    }
    
    // Calculate cart total
    cart.total = parseFloat(
      cart.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );
    
    // Verify total is a valid number
    if (isNaN(cart.total)) {
      console.error('Invalid cart total calculation');
      return res.status(500).json({ message: 'Error calculating cart total' });
    }
    
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Get product to check inventory and recalculate price
    const product = await Product.findById(cart.items[itemIndex].product);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.inventory < quantity) {
      return res.status(400).json({ message: 'Not enough inventory' });
    }
    
    // Ensure product has a valid price
    const productPrice = parseFloat(parseFloat(product.price || 0).toFixed(2));
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity and subtotal
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = parseFloat(
        (productPrice * quantity).toFixed(2)
      );
    }
    
    // Recalculate total (safely)
    cart.total = parseFloat(
      cart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0).toFixed(2)
    );
    
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Recalculate total (safely)
    cart.total = parseFloat(
      cart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0).toFixed(2)
    );
    
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
