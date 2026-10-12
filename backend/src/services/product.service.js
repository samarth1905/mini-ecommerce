// Service = business logic. Knows about the database and the rules, but not about HTTP.
const Product = require('../models/product.model');
const { DEFAULT_IMAGE } = require('../models/product.model');
const AppError = require('../utils/AppError');

const SORTS = {
  'low-high': { price: 1 },
  'high-low': { price: -1 },
  newest: { createdAt: -1 },
  rating: { 'rating.rate': -1 },
};

// Makes user text safe to use inside a regular expression
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Rule: product titles must be unique (case-insensitive)
async function assertTitleIsFree(title, ignoreId = null) {
  const filter = { title };
  if (ignoreId) filter._id = { $ne: ignoreId };
  const existing = await Product.findOne(filter).collation({ locale: 'en', strength: 2 }).select('_id');
  if (existing) throw new AppError('A product with this title already exists', 409);
}

async function list({ search, category, sort, minPrice, maxPrice, page, limit }) {
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { category: rx }];
  }
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const order = { ...(SORTS[sort] || {}), id: 1 }; // id keeps the order stable between pages

  const [items, total] = await Promise.all([
    Product.find(filter).sort(order).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

async function getById(id) {
  const product = await Product.findOne({ id });
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

async function getCategories() {
  return (await Product.distinct('category')).sort();
}

async function create(data) {
  await assertTitleIsFree(data.title);
  return Product.create(data);
}

// PUT replaces the product: optional fields that are not sent go back to their defaults
async function update(id, data) {
  const product = await getById(id);
  await assertTitleIsFree(data.title, product._id);
  product.set({ image: DEFAULT_IMAGE, stock: 0, rating: { rate: 0, count: 0 }, ...data });
  return product.save(); // runs the schema validation again
}

async function remove(id) {
  const product = await Product.findOneAndDelete({ id });
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

module.exports = { list, getById, getCategories, create, update, remove };
