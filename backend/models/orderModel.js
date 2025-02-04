const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    },
    otp: {
        type: String,
    },
    deliveryDate: Date,
    transactionDate: Date
}, {
    timestamps: true
});

// Pre-save middleware to hash OTP
orderSchema.pre('save', async function(next) {
    if (this.isModified('otp')) {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
    }
    next();
});

// Generate OTP
orderSchema.methods.generateOTP = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify OTP
orderSchema.methods.verifyOTP = async function(candidateOTP) {
    return await bcrypt.compare(candidateOTP, this.otp);
};

// Complete Order
orderSchema.methods.completeOrder = async function() {
    this.status = 'delivered';
    this.deliveryDate = new Date();
    this.transactionDate = new Date();
    await this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
