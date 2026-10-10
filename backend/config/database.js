const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        error.message = `MongoDB connection failed: ${error.message}`;
        throw error;
    }
}

module.exports = connectDatabase;