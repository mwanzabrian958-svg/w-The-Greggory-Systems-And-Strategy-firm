const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_greggory_systems_and_strategy_firm_db';
    await mongoose.connect(mongoUri);
    console.log('[MONGODB] Connected successfully');
  } catch (error) {
    console.error('[MONGODB] Connection failed:', error.message);
    throw error;
  }
};

module.exports = { connectMongoDB };
