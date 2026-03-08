const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

  } catch (error) {

    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);

  }

};

module.exports = { connectDB };