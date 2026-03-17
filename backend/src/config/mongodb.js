const mongoose = require('mongoose');
const logger = require('../utils/logger');
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_logs');
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
}
module.exports = { connectMongo };
