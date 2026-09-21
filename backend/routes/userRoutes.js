const express = require('express');
const User = require('../models/User');

const router = express.Router();

// get all users
router.get('/', async (req, res) =>
{
    try
    {
        const users = await User.find();
        res.status(200).json(users);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

// create new user
router.post('/', async (req, res) =>
{
    const user = new User(req.body);
    
    try
    {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    }
    catch (error)
    {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
