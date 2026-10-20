const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get all users (excluding password)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const formatted = users.map(user => ({
            id: user.email ? user.email.split('@')[0].toLowerCase() : user._id.toString(),
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            capacity: user.capacity || 14
        }));
        res.status(200).json(formatted);
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
        const { name, email, password, role, capacity } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const userRole = (role && role.trim()) ? role.trim() : 'Software engineer';
        const userCapacity = (capacity !== undefined && capacity !== null && !isNaN(Number(capacity)))
            ? Math.max(1, Math.min(40, Number(capacity)))
            : 14;

        const user = new User({
            name: name.trim(),
            email: cleanEmail,
            password,
            role: userRole,
            capacity: userCapacity
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
        res.status(400).json({ message: error.message || 'Registration failed' });
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
