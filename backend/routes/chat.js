const express = require('express');
const { handleChat } = require('../controllers/chatController');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log('Request path:', req.path);
    next();
  });

router.post('/chat', handleChat);

module.exports = router;