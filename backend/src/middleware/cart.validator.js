// Accepts only { items: [{ productId, quantity }] }. Any price sent by the browser is ignored.
const AppError = require('../utils/AppError');

const isWhole = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

function validateCartItems(req, res, next) {
  const items = req.body && req.body.items;
  const errors = [];

  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    return next(new AppError('Validation failed', 400, [{ field: 'items', message: 'items must be a list of 1 to 50 entries' }]));
  }

  const clean = items.map((item, i) => {
    const productId = Number(item && item.productId);
    const quantity = Number(item && item.quantity);
    if (!isWhole(productId, 1, 999999999)) errors.push({ field: `items[${i}].productId`, message: 'productId must be a whole number, 1 or more' });
    if (!isWhole(quantity, 1, 99)) errors.push({ field: `items[${i}].quantity`, message: 'quantity must be a whole number from 1 to 99' });
    return { productId, quantity };
  });

  if (errors.length) return next(new AppError('Validation failed', 400, errors));
  req.validated = { body: { items: clean } };
  next();
}

module.exports = { validateCartItems };
