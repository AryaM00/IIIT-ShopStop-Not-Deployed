const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const xml2js = require('xml2js');
const fetch = require('node-fetch');
const { casConfig } = require('../config/casConfig'); 
const axios = require('axios');
require('dotenv').config();


const createToken = (_id) => {
    return  jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '2d' });
}

// get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching users. Please try again.' });
    }
};
// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('email', email);
    console.log('password', password);
    // hashed value of this password;
    // console.log('hashed value of this password', bcrypt.hashSync(password, 10));

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        console.log('user', user);
        if (!user) {
            return res.status(400).json({ error: 'Incorrect email address.' });
        }
    

        // Compare the provided password with the stored hashed password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password.' });
        }

        // Generate JWT token
        const token = createToken(user._id);

        // If everything is correct, return a success response along with the token
        res.status(200).json({
            message: 'Login successful.',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                contactNumber: user.contactNumber,
            },
            token: token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while logging in. Please try again.' });
    }
};
// CAS login
const CasLogin = async (req, res) => {  
    // Add missing slash between base URL and path
    const callbackUrl = `${casConfig.service_url}/api/user/cas/callback`;
    const loginUrl = `${casConfig.cas_url}/login?service=${encodeURIComponent(callbackUrl)}`;
    console.log('CAS Login URL:', loginUrl);
    res.redirect(loginUrl);
};

// Validate CAS ticket
const validateCasTicket = async (ticket) => {
    try {
        const callbackUrl = `${casConfig.service_url}/api/user/cas/callback`; // Match login URL
        const validateUrl = `${casConfig.cas_url}/serviceValidate?service=${encodeURIComponent(callbackUrl)}&ticket=${ticket}`;
        console.log('Validation URL:', validateUrl);
        
        const response = await axios.get(validateUrl);
        console.log('CAS Response:', response.data); // Debug XML response

        return new Promise((resolve, reject) => {
            xml2js.parseString(response.data, (err, result) => {
                if (err) {
                    console.error('XML Parse Error:', err);
                    reject(err);
                }
                
                console.log('Parsed Result:', JSON.stringify(result, null, 2)); // Debug parsed XML
                
                const serviceResponse = result['cas:serviceResponse'];
                if (serviceResponse && serviceResponse['cas:authenticationSuccess']) {
                    const success = serviceResponse['cas:authenticationSuccess'][0];
                    const user = {
                        email: success['cas:user'][0],
                        attributes: success['cas:attributes'] ? success['cas:attributes'][0] : {}
                    };
                    resolve(user);
                } else {
                    reject(new Error('CAS Authentication failed'));
                }
            });
        });
    } catch (error) {
        console.error('Validation Error:', error);
        throw new Error(`CAS Validation failed: ${error.message}`);
    }
};
// review seller
const addReview = async (req, res) => {
    try {
        const { id } = req.params; // seller id
        const { rating, comment, reviewerId } = req.body;

        // Validate input
        if (!rating || !comment || !reviewerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if seller exists
        const seller = await User.findById(id);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        // Check if reviewer exists and prevent self-review
        if (id === reviewerId) {
            return res.status(400).json({ error: 'Cannot review yourself' });
        }

        // Check if already reviewed
        const existingReview = seller.sellerReviews.find(
            review => review.reviewer.toString() === reviewerId
        );
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this seller' });
        }

        // Create and add review
        const review = {
            reviewer: reviewerId,
            rating: Number(rating),
            comment,
            createdAt: new Date()
        };

        seller.sellerReviews.push(review);

        // Update average rating
        const totalRating = seller.sellerReviews.reduce((sum, review) => sum + review.rating, 0);
        seller.averageRating = totalRating / seller.sellerReviews.length;
        seller.totalReviews = seller.sellerReviews.length;

        await seller.save();

        // Populate reviewer details
        const populatedReview = await User.populate(review, {
            path: 'reviewer',
            select: 'firstName lastName email'
        });
        
        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};
  
  
  // CAS Callback route
  const casCallback = async (req, res) => {
    try {
        const { ticket } = req.query;
        console.log('ticket', ticket);
        
        if (!ticket) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_ticket`);
        }

        // Validate CAS ticket and get user data
        const casUserData = await validateCasTicket(ticket);
        const attributes = casUserData.attributes;
        
        // Check if user exists
        let user = await User.findOne({ email: attributes['cas:E-Mail'][0] });
        
        if (!user) {
            // Create new user with CAS data
            user = new User({
                email: attributes['cas:E-Mail'][0],
                firstName: attributes['cas:FirstName'][0],
                lastName: attributes['cas:LastName'][0],
                isCasUser: true,
                password: bcrypt.hashSync(Math.random().toString(36), 10),
            });
            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "2d" }
        );

        // Prepare user data for frontend
        const responseData = {
            message: "Login successful",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                contactNumber: user.contactNumber
            },
            token: token
        };

        // Redirect to frontend with encoded data
        res.redirect(`${process.env.FRONTEND_URL}/caslogin?data=${encodeURIComponent(JSON.stringify(responseData))}`);
    } catch (error) {
        console.error('CAS authentication error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=cas_auth_failed`);
    }
};



// signup user
const signupUser = async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;

    // Validation checks...
    if (!firstName || !lastName || !email || !age || !contactNumber || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Email and contact validation...
    const iiitEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.?iiit\.ac\.in$/
    if (!iiitEmailRegex.test(email)) {
        return res.status(400).json({ error: 'Email must be a valid IIIT email address (e.g.,  user@students.iiit.ac.in).' });
    }

    const contactNumberRegex = /^\d{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
        return res.status(400).json({ error: 'Contact number must be a valid 10-digit number.' });
    }

    try {
        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            age,
            contactNumber,
            password,
        });

        // Save user
        const savedUser = await newUser.save();

        // Create token
        const token = createToken(savedUser._id);

        // Return user data format matching local storage structure
        res.status(201).json({ 
            user: {
                _id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                age: savedUser.age,
                contactNumber: savedUser.contactNumber
            },
            token 
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map((error) => error.message);
            return res.status(400).json({ error: errorMessages });
        }

        if (err.code === 11000 && err.keyValue.email) {
            return res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
        }

        console.error('Signup error:', err);
        res.status(500).json({ error: 'An error occurred while signing up. Please try again.' });
    }
};

// get a single user
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the user. Please try again.' });
    }
};
const addToCart = async (req, res) => {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Check if user is the seller
        if (product.sellerId.toString() === userId) {
            return res.status(400).json({ 
                error: 'You cannot add your own product to cart',
                isOwner: true 
            });
        }
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if product already exists in cart
        const cartItemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            // Update quantity if product exists
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            // Add new product to cart
            user.cart.push({ product: productId, quantity });
        }

        // Save updated cart
        await user.save();

        // Fetch updated cart with populated product details
        const updatedUser = await User.findById(userId).populate('cart.product');

        res.status(200).json({
            message: 'Cart updated successfully',
            cart: updatedUser.cart
        });


    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};
const getCart = async (req, res) => {
    const userId = req.params.userId;
    console.log('Fetching cart for user:', userId);

    try {
        const user = await User.findById(userId).populate({
            path: 'cart.product',
            select: 'name price imageUrl category description'
        });

    

        if (!user) {
            
            return res.status(404).json({ error: 'User not found' });
        }
        json = user.cart;
        console.log(json);
        res.status(200).json({
            cart: user.cart,
            total: user.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        });

    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
};
const updateUser = async (req, res) => {
    try {
        // Get field to update from request body
        const updates = req.body;
        const userId = req.params.id;

        // Prevent email updates for security
        delete updates.email;
        
        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields
        Object.keys(updates).forEach(field => {
            if (field !== 'password' && field !== 'email') {
                user[field] = updates[field];
            }
        });

        // Save updated user
        await user.save();
        
        // Return updated user without sensitive info
        const updatedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            age: user.age,
            contactNumber: user.contactNumber
        };

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Update user error:', err);
        res.status(400).json({ error: err.message });
    }
};
const updatePassword = async (req, res) => {
    // console.log('res', res);
    try {

        const { currentPassword, newPassword } = req.body;
        console.log('newPassword', newPassword);
        const userId = req.params.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Password update error:', err);
        res.status(400).json({ error: 'Failed to update password' });
    }
};
// update cart quantity for my user
const updateCartQuantity = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
        return res.status(400).json({ error: 'User ID, Product ID, and quantity are required.' });
    }

    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Find product in cart
        const cartItem = user.cart.find(item => item.product.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart.' });
        }

        // Update quantity
        cartItem.quantity += quantity;
        if (cartItem.quantity <= 0) {
            // Remove item if quantity is zero or less
            user.cart = user.cart.filter(item => item.product.toString() !== productId);
        }

        // Save updated cart
        await user.save();

        // Fetch updated cart with populated product details
        const updatedUser = await User.findById(userId).populate('cart.product');

        res.status(200).json({
            message: 'Cart updated successfully',
            cart: updatedUser.cart
        });
    } catch (err) {
        console.error('Update cart quantity error:', err);
        res.status(500).json({ error: 'Failed to update cart quantity' });
    }
};
// remove item from cart
const removeFromCart = async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }

    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Remove product from cart
        user.cart = user.cart.filter(item => item.product.toString() !== productId);

        // Save updated cart
        await user.save();

        // Fetch updated cart with populated product details
        const updatedUser = await User.findById(userId).populate('cart.product');

        res.status(200).json({
            message: 'Item removed from cart',
            cart: updatedUser.cart
        });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
}
// clear cart
const clearCart = async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Clear cart
        user.cart = [];

        // Save updated cart
        await user.save();

        // Fetch updated cart with populated product details
        const updatedUser = await User.findById(userId).populate('cart.product');

        res.status(200).json({
            message: 'Cart cleared successfully',
            cart: updatedUser.cart
        });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
}
module.exports = {
    signupUser,
    loginUser,
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
    CasLogin,
    addReview
};

