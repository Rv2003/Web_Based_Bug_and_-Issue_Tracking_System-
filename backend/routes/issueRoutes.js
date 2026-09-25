const express = require('express');
const Issue = require('../models/Issue');

const router = express.Router();

// get all issues
router.get('/', async (req, res) =>
{
    try
    {
        const issues = await Issue.find().sort({ createdAt: -1 });
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

// update issue by id
router.put('/:id', async (req, res) =>
{
    try
    {
        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedIssue)
        {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.status(200).json(updatedIssue);
    }
    catch (error)
    {
        res.status(400).json({ message: error.message });
    }
});

// delete issue by id
router.delete('/:id', async (req, res) =>
{
    try
    {
        const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
        if (!deletedIssue)
        {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: 'Issue deleted successfully' });
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
