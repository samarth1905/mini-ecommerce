const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.summarize(req.validated.body.items);
  res.json({ success: true, data: summary });
});
