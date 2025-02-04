const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const createOrder = async (req, res) => {
    try {
        const { buyerId, items } = req.body;

        // Create orders for each item
        const orders = await Promise.all(items.map(async (item) => {
            // Get complete product details
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }


            // Create new order
            const order = new Order({
                buyerId,
                sellerId: product.sellerId,
                productId: item.productId,
                quantity: item.quantity,
                totalAmount: item.quantity * product.price,
                status: 'pending',
                productDetails: {
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    category: product.category
                }
            });
            // Generate OTP

            // Save order
            await order.save();
            return order;
        }));

        res.status(201).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// get my pending orders
const getMyPendingOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({
            buyerId: userId,
            status: 'pending'
        })
        .populate('productId') // Populate product details
        .populate('sellerId', 'firstName lastName email') // Populate seller details
        .sort({ createdAt: -1 }); // Sort by newest first

        res.json({ 
            success: true,
            orders: orders, // Will be an array (empty if no orders found)
            count: orders.length
        });

    } catch (error) {
        console.error('Get pending orders error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// get buyer completed orders
const getMyCompletedOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({
            buyerId: userId,
            status: 'delivered'
        })
        .populate('productId') // Populate product details
        .populate('sellerId', 'firstName lastName email') // Populate seller details
        .sort({ createdAt: -1 }); // Sort by newest first
        res.json({
            success: true,
            orders: orders, // Will be an array (empty if no orders found)
            count: orders.length
        });
    } catch (error) {
        console.error('Get completed orders error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// generate otp
const generateOTP = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.otp = order.generateOTP();
        const otpToReturn = order.otp;
        await order.save();
        res.json({
            success: true,
            otp: otpToReturn
        });
    } catch (error) {
        console.error('Generate OTP error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// get sender pending orders
const getSellerPendingOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({
            sellerId: userId,
            status: 'pending'
        })
        .populate('productId') // Populate product details
        .populate('buyerId', 'firstName lastName email') // Populate buyer details
        .sort({ createdAt: -1 }); // Sort by newest first
        res.json({
            success: true,
            orders: orders, // Will be an array (empty if no orders found)
            count: orders.length
        });
    } catch (error) {

        console.error('Get pending orders error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// verify otp
const verifyOTP = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { otp } = req.body;
        const order = await Order.findById (orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        const isMatch = await order.verifyOTP(otp);
        if (isMatch) {
            order.status = 'delivered';
            order.deliveryDate = new Date();
            await order.save();
  

            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid OTP'
            });
        }


    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// get seller completed orders
const getSellerCompletedOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({
            sellerId: userId,
            status: 'delivered'
        })
        .populate('productId') // Populate product details
        .populate('buyerId', 'firstName lastName email') // Populate buyer details
        .sort({ createdAt: -1 }); // Sort by newest first
        res.json({
            success: true,
            orders: orders, // Will be an array (empty if no orders found)
            count: orders.length
        });
    }
    catch (error) {
        console.error('Get completed orders error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};



module.exports = { 
    createOrder,
    getMyPendingOrders,
    getMyCompletedOrders,
    generateOTP,
    getSellerPendingOrders,
    getSellerCompletedOrders,
    verifyOTP
 };