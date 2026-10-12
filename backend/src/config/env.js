// Loads .env and checks required settings, so the app fails early with a clear message
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI. Copy .env.example to .env and set it.');
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
};
