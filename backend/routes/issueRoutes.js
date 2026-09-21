const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

// get all issues
router.get('/', async (req, res) =>
{
    try
    {
        const issues = await Issue.find().populate('assignee', 'name email');
        res.status(200).json(issues);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

// create new issue
router.post('/', async (req, res) =>
{
    const issue = new Issue(req.body);
    
    try
    {
        const savedIssue = await issue.save();
        res.status(201).json(savedIssue);
    }
    catch (error)
    {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
