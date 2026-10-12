// Connects to MongoDB using Mongoose
const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

// Log connection problems that happen after startup (the API answers 503 meanwhile)
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

module.exports = connectDB;
