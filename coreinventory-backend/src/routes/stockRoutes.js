const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const stockCtrl = require('../controllers/stockController');
const adjustmentCtrl = require('../controllers/adjustmentController');

router.use(authenticate, tenantMiddleware);

// Stock reads
router.get('/', stockCtrl.getAll);
router.get('/ledger', stockCtrl.getLedger);
router.get('/product/:productId', stockCtrl.getByProduct);

// Adjustments
router.post('/adjust', adjustmentCtrl.create);

module.exports = router;
