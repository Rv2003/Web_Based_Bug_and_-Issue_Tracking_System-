const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
    {
        title: 
        {
            type: String,
            required: true
        },
        description: 
        {
            type: String
        },
        status: 
        {
            type: String,
            enum: ['todo', 'in progress', 'review', 'done'],
            default: 'todo'
        },
        priority: 
        {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'low'
        },
        project: 
        {
            type: String,
            required: true
        },
        assignee: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dueDate: 
        {
            type: Date
        }
    }, 
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Issue', issueSchema);
