// Fills the database with the 15 demo products (ids 1-15).  Run: npm run seed
// WARNING: deletes all existing products first.
const connectDB = require('../config/db');
const Product = require('../models/product.model');
const Counter = require('../models/counter.model');
const products = require('./products.json');

(async () => {
  await connectDB();
  await Product.deleteMany({});
  const created = await Product.insertMany(products);
  // next product created through the API gets id 16
  await Counter.findOneAndUpdate({ _id: 'product' }, { seq: created.length }, { upsert: true });
  console.log(`Seeded ${created.length} products`);
  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
