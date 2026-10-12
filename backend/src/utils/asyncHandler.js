// Sends errors from async controllers to the error middleware (no try/catch in every controller)
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
