// If MongoDB is not connected (e.g. it went down after the server started), answer 503 instead of hanging
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next(); // 1 = connected
  next(new AppError('Database is not available. Please try again shortly.', 503));
};
