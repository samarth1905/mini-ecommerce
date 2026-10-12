const router = require('express').Router();
const mongoose = require('mongoose');
const requireDatabase = require('../middleware/requireDatabase');

router.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    status: connected ? 'ok' : 'database unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

router.use('/products', requireDatabase, require('./product.routes'));
router.use('/cart', requireDatabase, require('./cart.routes'));

module.exports = router;
