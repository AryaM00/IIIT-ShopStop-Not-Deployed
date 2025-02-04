const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // For password hashing
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*iiit\.ac\.in$/,
  },
  age: {
    type: Number,
    // required: true,
    // min: 18, // Optional: Minimum age restriction
  },
  contactNumber: {
    type: String,
    // required: true,
    match: /^\d{10}$/, // Ensure a valid 10-digit number
  },
  password: {
    type: String,
    required: true,
  },
  cart: [cartItemSchema],
  sellerReviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.pre('save', async function(next) {
  if (this.sellerReviews.length > 0) {
    const total = this.sellerReviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.sellerReviews.length;
    this.totalReviews = this.sellerReviews.length;
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
