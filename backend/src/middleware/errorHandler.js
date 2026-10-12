const AppError = require('../utils/AppError');

// Turns known database/parsing errors into friendly AppErrors
function normalize(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') return new AppError('Invalid JSON body', 400);
  if (err.type === 'entity.too.large') return new AppError('Request body too large', 413);
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError('Validation failed', 400, details);
  }
  if (['MongooseServerSelectionError', 'MongoNetworkError', 'MongoNetworkTimeoutError'].includes(err.name)) {
    return new AppError('Database is not available. Please try again shortly.', 503);
  }
  if (err.name === 'CastError') return new AppError(`Invalid ${err.path}`, 400);
  if (err.code === 11000) return new AppError('A product with this title already exists', 409);
  return err;
}

// Every error ends here and is sent as JSON in one consistent format
module.exports = (err, req, res, next) => {
  const error = normalize(err);
  const status = error.statusCode || 500;

  if (status === 500) console.error(err); // real bugs are logged, never shown to the user

  const body = { success: false, error: status === 500 ? 'Something went wrong on the server' : error.message };
  if (error.details) body.errors = error.details;
  res.status(status).json(body);
};
