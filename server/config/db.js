const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("========================================");
    console.log("Connecting to MongoDB...");
    console.log("========================================");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log("========================================");
    console.log("✅ MongoDB connected successfully");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log("========================================");

    return conn;
  } catch (error) {
    console.error("========================================");
    console.error("❌ MongoDB connection failed");
    console.error("Error:", error.message);
    console.error("========================================");

    throw error;
  }
};

module.exports = connectDB;