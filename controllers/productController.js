const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create initial product (for testing purposes)
exports.createInitialProduct = async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    
    if (existingProducts.length > 0) {
      console.log('Initial product already exists, returning first product');
      return res.status(200).json({ 
        message: 'Using existing product', 
        product: existingProducts[0]
      });
    }
    
    // Create a sample product
    const product = new Product({
      title: 'Converse Chuck Taylor All Star II Hi',
      description: 'The Converse Chuck Taylor All Star II Hi gives the classic Chuck Taylor a modern upgrade with premium materials and enhanced comfort features.',
      price: 85.00,
      image: 'https://i.imgur.com/8yJQQJ9.jpeg',
      variants: [
        {
          name: 'Color',
          options: ['Black', 'White', 'Red', 'Blue']
        },
        {
          name: 'Size',
          options: ['7', '8', '9', '10', '11', '12']
        }
      ],
      inventory: 100
    });
    
    await product.save();
    console.log('Initial product created successfully');
    
    res.status(201).json({
      message: 'Initial product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating initial product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product inventory
exports.updateInventory = async (productId, quantity) => {
  try {
    // Use findOneAndUpdate to atomically update the inventory
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { inventory: -quantity } }, // Decrement inventory by quantity
      { new: true, runValidators: false } // Return updated document and disable validators
    );
    
    if (!updatedProduct) {
      console.error(`Product with ID ${productId} not found for inventory update`);
      return null;
    }
    
    console.log(`Inventory updated. New inventory: ${updatedProduct.inventory}`);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};
