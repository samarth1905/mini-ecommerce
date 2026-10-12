const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const { validateCartItems } = require('../middleware/cart.validator');

// The browser sends only product ids and quantities. Prices come from the database.
router.post('/summary', validateCartItems, ctrl.getSummary);

module.exports = router;
