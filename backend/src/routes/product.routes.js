const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { validateProductBody, validateProductId, validateProductQuery } = require('../middleware/product.validator');

router.get('/', validateProductQuery, ctrl.getProducts);
router.get('/categories', ctrl.getCategories); // keep above '/:id'
router.post('/', validateProductBody, ctrl.createProduct);

router.get('/:id', validateProductId, ctrl.getProduct);
router.put('/:id', validateProductId, validateProductBody, ctrl.updateProduct);
router.delete('/:id', validateProductId, ctrl.deleteProduct);

module.exports = router;
