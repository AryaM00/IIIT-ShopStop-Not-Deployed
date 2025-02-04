const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct,getProduct } = require('../controllers/productController');

// Get all products
router.get('/', getAllProducts);

// Add a new product
router.post('/', addProduct);

// Get a single product
router.get('/:id', getProduct);


module.exports = router;