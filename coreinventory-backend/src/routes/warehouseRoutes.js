const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const ctrl = require('../controllers/warehouseController');

router.use(authenticate, tenantMiddleware);

// Warehouses
router.get('/warehouses', ctrl.getWarehouses);
router.get('/warehouses/:id', ctrl.getWarehouseById);
router.post('/warehouses', authorize(['inventory_manager']), ctrl.createWarehouse);
router.put('/warehouses/:id', authorize(['inventory_manager']), ctrl.updateWarehouse);
router.delete('/warehouses/:id', authorize(['inventory_manager']), ctrl.deleteWarehouse);

// Locations
router.get('/locations', ctrl.getLocations);
router.get('/locations/:id', ctrl.getLocationById);
router.post('/locations', authorize(['inventory_manager']), ctrl.createLocation);
router.put('/locations/:id', authorize(['inventory_manager']), ctrl.updateLocation);
router.delete('/locations/:id', authorize(['inventory_manager']), ctrl.deleteLocation);

module.exports = router;
