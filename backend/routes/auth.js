const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    const { username, email, password, role } = req.body;

    // Check if all required fields are present
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide username, email, and password'
      });
    }

    // 🚫 BLOCK ADMIN REGISTRATION - Only through admin panel
    if (role === 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Admin registration is not allowed through this endpoint. Contact system administrator.'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'student'
    });

    // Remove password from output
    newUser.password = undefined;

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.log('Registration error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    const token = signToken(user._id);
    
    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;