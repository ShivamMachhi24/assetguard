const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from .env
 * Called once at server startup. Crashes fast on failure so we
 * don't silently run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options silence deprecation warnings in Mongoose 7+
      // and are safe to keep for older versions too.
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Fail fast — don't run with no DB
  }
};

module.exports = connectDB;
