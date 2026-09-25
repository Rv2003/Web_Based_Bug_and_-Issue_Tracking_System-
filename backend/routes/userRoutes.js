const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get all users (excluding password)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'task_tracker_jwt_secret_key',
            { expiresIn: '7d' }
        );

        const username = user.email.split('@')[0].toLowerCase();

        res.status(200).json({
            token,
            user: {
                id: username,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                capacity: user.capacity || 14
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = new User({
            name,
            email: email.toLowerCase().trim(),
            password,
            role
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'task_tracker_jwt_secret_key',
            { expiresIn: '7d' }
        );

        const username = user.email.split('@')[0].toLowerCase();

        res.status(201).json({
            token,
            user: {
                id: username,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                capacity: user.capacity || 14
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Legacy create new user
router.post('/', async (req, res) => {
    const user = new User(req.body);
    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
