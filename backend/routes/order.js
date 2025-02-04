const express = require('express');
const {
    createOrder,
    getMyPendingOrders,
    generateOTP,
    getSellerPendingOrders,
    getSellerCompletedOrders,
    verifyOTP,
    getMyCompletedOrders
} = require('../controllers/orderController');
const Order = require('../models/orderModel');
const router = express.Router();

// create a new order


router.post('/create', createOrder);

// get buyer pending orders
router.get('/buyer/pending/:userId', getMyPendingOrders);
// get buyer completed orders
router.get('/buyer/completed/:userId', getMyCompletedOrders);

// generate otp
router.post('/generate-otp/:orderId', generateOTP);

//get seller pending orders
router.get('/seller/pending/:userId', getSellerPendingOrders);

//get seller completed orders
router.get('/seller/completed/:userId', getSellerCompletedOrders);

// verify otp   
router.post('/verify/:orderId', verifyOTP);



module.exports = router;
