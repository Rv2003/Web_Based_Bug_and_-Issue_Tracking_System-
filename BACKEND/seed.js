const mongoose = require('mongoose');
require('dotenv').config();
const Issue = require('./models/Issue');
const User = require('./models/User');

const seedUsers = [
    { name: 'Priya Nair', email: 'priya@example.com', password: 'password123', role: 'Product manager', capacity: 10 },
    { name: 'Amara Okafor', email: 'amara@example.com', password: 'password123', role: 'Backend engineer', capacity: 16 },
    { name: 'Kenji Watanabe', email: 'kenji@example.com', password: 'password123', role: 'Frontend engineer', capacity: 16 },
    { name: 'Lucía Herrera', email: 'lucia@example.com', password: 'password123', role: 'QA engineer', capacity: 14 },
    { name: 'Tomás Silva', email: 'tomas@example.com', password: 'password123', role: 'Platform engineer', capacity: 16 },
    { name: 'Sofia Lindqvist', email: 'sofia@example.com', password: 'password123', role: 'Product designer', capacity: 14 },
    { name: 'Daniel Mensah', email: 'daniel@example.com', password: 'password123', role: 'Mobile engineer', capacity: 12 },
    { name: 'Hana Kim', email: 'hana@example.com', password: 'password123', role: 'Data engineer', capacity: 16 }
];

const seedIssues = [
    { title: 'Design tokens audit', project: 'web', assignee: 'sofia', status: 'done', priority: 'medium', points: 3, dueDate: '2026-09-14' },
    { title: 'Migrate billing webhooks to v2', project: 'billing', assignee: 'amara', status: 'progress', priority: 'high', points: 5, dueDate: '2026-09-23' },
    { title: 'Idempotency keys for the refund endpoint', project: 'billing', assignee: 'amara', status: 'review', priority: 'urgent', points: 3, dueDate: '2026-09-21' },
    { title: 'Invoice PDF shows the wrong currency symbol', project: 'billing', assignee: 'lucia', status: 'todo', priority: 'medium', points: 2, dueDate: '2026-09-22' },
    { title: 'Rebuild the onboarding checklist', project: 'web', assignee: 'kenji', status: 'progress', priority: 'high', points: 8, dueDate: '2026-09-25' },
    { title: 'Empty states for the project list', project: 'web', assignee: 'sofia', status: 'review', priority: 'low', points: 2, dueDate: '2026-09-22' },
    { title: 'Keyboard navigation in the command palette', project: 'web', assignee: 'kenji', status: 'todo', priority: 'medium', points: 3, dueDate: '2026-09-24' },
    { title: 'Offline queue for mobile check-ins', project: 'mobile', assignee: 'daniel', status: 'progress', priority: 'high', points: 8, dueDate: '2026-09-25' },
    { title: 'Crash on Android 13 during photo upload', project: 'mobile', assignee: 'daniel', status: 'todo', priority: 'urgent', points: 5, dueDate: '2026-09-18' },
    { title: 'Push notification opt-in copy', project: 'mobile', assignee: 'sofia', status: 'done', priority: 'low', points: 1, dueDate: '2026-09-16' },
    { title: 'Canary deploys for the search service', project: 'platform', assignee: 'tomas', status: 'progress', priority: 'high', points: 5, dueDate: '2026-09-24' },
    { title: 'Rotate staging database credentials', project: 'platform', assignee: 'tomas', status: 'done', priority: 'medium', points: 2, dueDate: '2026-09-15' },
    { title: 'Alert when p95 latency passes 800 ms', project: 'platform', assignee: 'tomas', status: 'todo', priority: 'medium', points: 3, dueDate: '2026-09-25' },
    { title: 'Cohort retention query times out', project: 'data', assignee: 'hana', status: 'progress', priority: 'urgent', points: 5, dueDate: '2026-09-21' },
    { title: 'Backfill events for schema v3', project: 'data', assignee: 'hana', status: 'review', priority: 'medium', points: 3, dueDate: '2026-09-22' },
    { title: 'Regression suite for the checkout flow', project: 'billing', assignee: 'lucia', status: 'progress', priority: 'medium', points: 5, dueDate: '2026-09-23' },
    { title: 'Write release notes for 24.9', project: 'web', assignee: 'priya', status: 'todo', priority: 'low', points: 1, dueDate: '2026-09-25' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bug_tracker');
        console.log('Connected to MongoDB.');

        // Insert issues if none exist
        const issueCount = await Issue.countDocuments();
        if (issueCount === 0) {
            await Issue.insertMany(seedIssues);
            console.log(`Seeded ${seedIssues.length} issues successfully.`);
        } else {
            console.log(`Issues collection already has ${issueCount} items.`);
        }

        // Insert or update users with hashed passwords
        for (const u of seedUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = new User(u);
                await user.save();
                console.log(`Created user ${u.name}`);
            } else {
                user.password = u.password;
                user.capacity = u.capacity;
                await user.save();
                console.log(`Updated user ${u.name} with password`);
            }
        }
        console.log('Users verified and passwords updated successfully.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
