const AppError = require('../utils/AppError');

// For unknown /api/... URLs
module.exports = (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
