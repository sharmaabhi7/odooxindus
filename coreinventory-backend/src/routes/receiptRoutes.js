const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const ctrl = require('../controllers/receiptController');

router.use(authenticate, tenantMiddleware);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/:id/validate', ctrl.validate);

module.exports = router;
