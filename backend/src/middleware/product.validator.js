// Validation middleware. Bad input is rejected here, before it reaches a controller.
// Clean (trimmed, whitelisted) values are placed on req.validated.
const AppError = require('../utils/AppError');

const PRODUCT_ID = /^[1-9]\d{0,8}$/; // whole number 1 or more
const IMAGE_PATTERN = /^(https?:\/\/|\/|images\/)\S+$/i; // blocks things like "javascript:..."
const SORT_OPTIONS = ['low-high', 'high-low', 'newest', 'rating'];

const text = (v) => (typeof v === 'string' ? v.trim() : undefined);

function num(v) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function fail(errors, next) {
  return next(new AppError('Validation failed', 400, errors));
}

// Used for POST and PUT
function validateProductBody(req, res, next) {
  const b = req.body || {};
  const errors = [];
  const data = {};

  const title = text(b.title);
  if (!title || title.length < 2 || title.length > 120) {
    errors.push({ field: 'title', message: 'Title is required (2-120 characters)' });
  } else data.title = title;

  const price = num(b.price);
  if (price === undefined || price <= 0 || price > 10000000) {
    errors.push({ field: 'price', message: 'Price must be a number greater than 0' });
  } else data.price = Math.round(price * 100) / 100;

  const description = text(b.description);
  if (!description || description.length < 10 || description.length > 1000) {
    errors.push({ field: 'description', message: 'Description is required (10-1000 characters)' });
  } else data.description = description;

  const category = text(b.category);
  if (!category || category.length < 2 || category.length > 50) {
    errors.push({ field: 'category', message: 'Category is required (2-50 characters)' });
  } else data.category = category.toLowerCase();

  if (b.image !== undefined) {
    const image = text(b.image);
    if (!image || image.length > 300 || !IMAGE_PATTERN.test(image)) {
      errors.push({ field: 'image', message: 'Image must be a http(s) URL or an images/... path' });
    } else data.image = image;
  }

  if (b.stock !== undefined) {
    const stock = num(b.stock);
    if (stock === undefined || !Number.isInteger(stock) || stock < 0 || stock > 100000) {
      errors.push({ field: 'stock', message: 'Stock must be a whole number from 0 to 100000' });
    } else data.stock = stock;
  }

  if (b.rating !== undefined) {
    const rate = num(b.rating && b.rating.rate);
    const count = num(b.rating && b.rating.count);
    if (rate === undefined || rate < 0 || rate > 5 || count === undefined || !Number.isInteger(count) || count < 0) {
      errors.push({ field: 'rating', message: 'Rating needs rate (0-5) and count (whole number, 0 or more)' });
    } else data.rating = { rate, count };
  }

  if (errors.length) return fail(errors, next);
  req.validated = { ...req.validated, body: data }; // only these fields are ever saved
  next();
}

// Used for routes with /:id  (ids are whole numbers: 1, 2, 3 ...)
function validateProductId(req, res, next) {
  if (!PRODUCT_ID.test(req.params.id)) {
    return fail([{ field: 'id', message: 'Product id must be a whole number, 1 or more' }], next);
  }
  req.validated = { ...req.validated, id: Number(req.params.id) };
  next();
}

// Used for GET /api/products
function validateProductQuery(req, res, next) {
  const q = req.query || {};
  const errors = [];
  const query = {};

  if (q.search !== undefined) {
    const search = text(q.search);
    if (search === undefined || search.length > 100) errors.push({ field: 'search', message: 'Search must be text up to 100 characters' });
    else if (search) query.search = search;
  }

  if (q.category !== undefined) {
    const category = text(q.category);
    if (category === undefined || category.length > 50) errors.push({ field: 'category', message: 'Category must be text up to 50 characters' });
    else if (category && category.toLowerCase() !== 'all') query.category = category.toLowerCase();
  }

  if (q.sort !== undefined && q.sort !== '' && q.sort !== 'default') {
    if (!SORT_OPTIONS.includes(q.sort)) errors.push({ field: 'sort', message: `Sort must be one of: ${SORT_OPTIONS.join(', ')}` });
    else query.sort = q.sort;
  }

  for (const field of ['minPrice', 'maxPrice']) {
    if (q[field] !== undefined && q[field] !== '') {
      const n = num(q[field]);
      if (n === undefined || n < 0) errors.push({ field, message: `${field} must be a number, 0 or more` });
      else query[field] = n;
    }
  }
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
    errors.push({ field: 'minPrice', message: 'minPrice cannot be greater than maxPrice' });
  }

  const page = q.page === undefined ? 1 : num(q.page);
  if (page === undefined || !Number.isInteger(page) || page < 1) errors.push({ field: 'page', message: 'Page must be a whole number, 1 or more' });
  else query.page = page;

  const limit = q.limit === undefined ? 10 : num(q.limit);
  if (limit === undefined || !Number.isInteger(limit) || limit < 1 || limit > 100) errors.push({ field: 'limit', message: 'Limit must be a whole number from 1 to 100' });
  else query.limit = limit;

  if (errors.length) return fail(errors, next);
  req.validated = { query };
  next();
}

module.exports = { validateProductBody, validateProductId, validateProductQuery };
