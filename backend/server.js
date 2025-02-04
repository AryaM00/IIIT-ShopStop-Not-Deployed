require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/order');

// express app
const app = express();
// Create HTTP server using app
const httpServer = createServer(app);

app.use(express.json());
app.use(cors());

// middleware to log every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/support', chatRoutes);
app.use('/api/orders', orderRoutes);


// mongodb connection  
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        httpServer.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.log(err));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});


