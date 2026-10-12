// An error we throw on purpose: message + HTTP status (+ optional list of field errors)
class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
module.exports = AppError;
