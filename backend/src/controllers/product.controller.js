// Controller = takes the (already validated) request, calls the service, sends the response
const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const { items, total, page, limit, pages } = await productService.list(req.validated.query);
  res.json({ success: true, count: items.length, total, page, limit, pages, data: items });
});

exports.getCategories = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await productService.getCategories() });
});

exports.getProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await productService.getById(req.validated.id) });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.validated.body);
  res.status(201).json({ success: true, message: 'Product created', data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(req.validated.id, req.validated.body);
  res.json({ success: true, message: 'Product updated', data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.remove(req.validated.id);
  res.json({ success: true, message: 'Product deleted', data: product });
});
