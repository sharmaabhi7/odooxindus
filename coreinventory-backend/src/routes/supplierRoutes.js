const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const ctrl = require('../controllers/supplierController');

router.use(authenticate, tenantMiddleware);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', authorize(['inventory_manager']), ctrl.update);
router.delete('/:id', authorize(['inventory_manager']), ctrl.remove);

module.exports = router;
