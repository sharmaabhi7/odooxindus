const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const dashCtrl = require('../controllers/dashboardController');
const catCtrl = require('../controllers/categoryController');
const { authorize } = require('../middleware/authMiddleware');

router.use(authenticate, tenantMiddleware);

// Dashboard
router.get('/dashboard', dashCtrl.getDashboard);

// Categories
router.get('/categories', catCtrl.getAll);
router.post('/categories', authorize(['inventory_manager']), catCtrl.create);
router.put('/categories/:id', authorize(['inventory_manager']), catCtrl.update);
router.delete('/categories/:id', authorize(['inventory_manager']), catCtrl.remove);

module.exports = router;
