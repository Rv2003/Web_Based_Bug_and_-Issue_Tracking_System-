const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connection
const connectDatabase = async () =>
{
    try 
    {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully");
    } 
    catch (error) 
    {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

connectDatabase();

// routes
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () =>
{
    console.log(`Server started on port ${PORT}`);
});
