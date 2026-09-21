const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
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

// Base route
app.get('/', (req, res) =>
{
    res.send("API is running");
});

app.listen(PORT, () =>
{
    console.log(`Server started on port ${PORT}`);
});
