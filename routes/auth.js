// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Make sure this line is here
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        // Add any other necessary user info here
    };
    return jwt.sign(payload, process.env.JWT_SECRET || "your_default_secret_key", { expiresIn: '24h' });
};

router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });
      const token = user.generateAuthToken();
      res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = user.generateAuthToken();
      res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

module.exports = router;