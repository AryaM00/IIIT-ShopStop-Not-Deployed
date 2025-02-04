const express = require('express');
const { 
    loginUser, 
    signupUser, 
    getUser, 
    addToCart, 
    getCart, 
    updateUser, 
    updatePassword, 
    updateCartQuantity,
    removeFromCart,
    getUsers,
    clearCart,
    casCallback,
    casLogin,
    CasLogin,
    addReview
 } = require('../controllers/userController');
const verifyCaptcha = require('../middleware/verifyCaptcha'); 
const User = require('../models/userModel');    

const router = express.Router();

// Increase max listeners limit to avoid warnings
require('events').EventEmitter.defaultMaxListeners = 15;

// Login route
router.post('/login', verifyCaptcha, loginUser);

// Signup route
router.post('/signup', signupUser);
// User information
router.get('/:id', getUser);
// get all users    
router.get('/', getUsers);
// Add to cart
router.post('/cart/add', addToCart);
// get all products of a particular user
router.get('/cart/:userId', getCart); 
// Update user information
router.put('/:id', updateUser);
// Update password of a user
router.put('/password/:id', updatePassword);
// Update cart quantity for my user
router.put('/cart/update', updateCartQuantity);
// remove item from cart
router.delete('/cart/remove', removeFromCart);
// clear cart 
router.delete('/cart/clear/:userId', clearCart);    
// cas login
router.get('/cas/login',CasLogin);
// cas callback
router.get('/cas/callback',casCallback);
// review user
router.post('/reviews/:id',addReview);







module.exports = router;