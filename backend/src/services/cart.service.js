// Service = cart rules. The server decides prices and checks stock; the browser is never trusted.
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

const round2 = (n) => Math.round(n * 100) / 100;

async function summarize(items) {
  // same product listed twice? add the quantities together
  const wanted = new Map();
  for (const { productId, quantity } of items) {
    wanted.set(productId, (wanted.get(productId) || 0) + quantity);
  }

  const products = await Product.find({ id: { $in: [...wanted.keys()] } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const problems = [];
  const lines = [];

  for (const [productId, quantity] of wanted) {
    const product = byId.get(productId);
    if (!product) {
      problems.push({ field: `product ${productId}`, message: 'Product not found' });
    } else if (quantity > product.stock) {
      problems.push({ field: `product ${productId}`, message: `Only ${product.stock} in stock for "${product.title}"` });
    } else {
      lines.push({
        productId,
        title: product.title,
        price: product.price, // from the database, never from the request
        quantity,
        subtotal: round2(product.price * quantity),
      });
    }
  }

  if (problems.length) throw new AppError('Some cart items are not available', 409, problems);

  return {
    items: lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    total: round2(lines.reduce((sum, l) => sum + l.subtotal, 0)),
  };
}

module.exports = { summarize };
