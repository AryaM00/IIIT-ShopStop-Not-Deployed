const Product = require('../models/productModel');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    // First get all products
    let products = await Product.find({})
      .sort({ createdAt: -1 });

    // Then populate seller details only if sellerId exists
    products = await Promise.all(products.map(async (product) => {
      if (product.sellerId) {
        try {
          await product.populate('sellerId', 'firstName lastName email');
        } catch (error) {
          console.log(`Could not populate seller for product ${product._id}`);
          // Keep original product without population if seller not found
        }
      }
      return product;
    }));

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching products. Please try again.' 
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  const { name, price, description, category, sellerId, imageUrl } = req.body;

  // Validate required fields
  if (!name || !price || !description || !category || !sellerId || !imageUrl) {
    return res.status(400).json({ error: 'All fields are required, including imageUrl.' });
  }

  // Create a new product instance
  const product = new Product({
    name,
    price,
    description,
    category,
    sellerId,
    imageUrl
  });

  try {
    // Save the new product
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    // Handle validation errors and duplicates
    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ error: errorMessages });
    }

    // Handle other errors
    res.status(500).json({ error: 'An error occurred while adding the product. Please try again.' });
  }
};
// get information of a single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the product. Please try again.' });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProduct
};