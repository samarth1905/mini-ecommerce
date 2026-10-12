// Run with: npm test   (uses Node's built-in test runner, no extra packages)
const test = require('node:test');
const assert = require('node:assert');
const { validateProductBody, validateProductId, validateProductQuery } = require('../src/middleware/product.validator');

// Runs a middleware and returns { error, req }
function run(middleware, req) {
  let error;
  middleware(req, {}, (e) => { error = e; });
  return { error, req };
}

const valid = {
  title: '  Test Poster  ',
  price: '499.456',
  description: 'A long enough description.',
  category: 'Posters',
};

test('valid product body is trimmed, lowercased and whitelisted', () => {
  const { error, req } = run(validateProductBody, { body: { ...valid, isAdmin: true, _id: 'x' } });
  assert.strictEqual(error, undefined);
  assert.deepStrictEqual(req.validated.body, {
    title: 'Test Poster', price: 499.46, description: 'A long enough description.', category: 'posters',
  });
});

test('missing and invalid fields return 400 with a list of errors', () => {
  const { error } = run(validateProductBody, { body: { title: 'a', price: -5, description: 'short', category: '' } });
  assert.strictEqual(error.statusCode, 400);
  assert.deepStrictEqual(error.details.map((d) => d.field).sort(), ['category', 'description', 'price', 'title']);
});

test('price must be a real number', () => {
  for (const price of ['abc', null, NaN, 0, '', undefined]) {
    const { error } = run(validateProductBody, { body: { ...valid, price } });
    assert.ok(error && error.details.some((d) => d.field === 'price'), `price ${price} should fail`);
  }
});

test('image must be http(s) or images/ path (blocks javascript:)', () => {
  assert.ok(run(validateProductBody, { body: { ...valid, image: 'javascript:alert(1)' } }).error);
  assert.strictEqual(run(validateProductBody, { body: { ...valid, image: 'images/a.svg' } }).error, undefined);
  assert.strictEqual(run(validateProductBody, { body: { ...valid, image: 'https://x.com/a.png' } }).error, undefined);
});

test('stock and rating are checked', () => {
  assert.ok(run(validateProductBody, { body: { ...valid, stock: 1.5 } }).error);
  assert.ok(run(validateProductBody, { body: { ...valid, stock: -1 } }).error);
  assert.ok(run(validateProductBody, { body: { ...valid, rating: { rate: 6, count: 1 } } }).error);
  const ok = run(validateProductBody, { body: { ...valid, stock: 10, rating: { rate: 4.5, count: 3 } } });
  assert.deepStrictEqual(ok.req.validated.body.rating, { rate: 4.5, count: 3 });
});

test('empty body is rejected', () => {
  assert.strictEqual(run(validateProductBody, { body: undefined }).error.statusCode, 400);
});

test('product id check', () => {
  const ok = run(validateProductId, { params: { id: '12' } });
  assert.strictEqual(ok.error, undefined);
  assert.strictEqual(ok.req.validated.id, 12);
  for (const id of ['0', '-1', 'abc', '1.5', '64b7f0c2a1b2c3d4e5f60718', "1'; drop"]) {
    assert.strictEqual(run(validateProductId, { params: { id } }).error.statusCode, 400, id);
  }
});

test('query defaults', () => {
  const { error, req } = run(validateProductQuery, { query: {} });
  assert.strictEqual(error, undefined);
  assert.deepStrictEqual(req.validated.query, { page: 1, limit: 10 });
});

test('query values are parsed and "all"/"default" are ignored', () => {
  const { req } = run(validateProductQuery, {
    query: { search: ' watch ', category: 'Jewelry', sort: 'low-high', minPrice: '100', maxPrice: '900', page: '2', limit: '5' },
  });
  assert.deepStrictEqual(req.validated.query, {
    search: 'watch', category: 'jewelry', sort: 'low-high', minPrice: 100, maxPrice: 900, page: 2, limit: 5,
  });
  const all = run(validateProductQuery, { query: { category: 'all', sort: 'default' } });
  assert.deepStrictEqual(all.req.validated.query, { page: 1, limit: 10 });
});

test('invalid query values return 400', () => {
  for (const query of [{ sort: 'cheapest' }, { limit: '1000' }, { page: '0' }, { minPrice: '500', maxPrice: '100' }, { minPrice: 'x' }]) {
    assert.strictEqual(run(validateProductQuery, { query }).error.statusCode, 400, JSON.stringify(query));
  }
});
