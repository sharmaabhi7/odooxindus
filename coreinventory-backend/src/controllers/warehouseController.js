const warehouseRepo = require('../repositories/warehouseRepository');
const locationRepo = require('../repositories/locationRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

// ─── WAREHOUSES ────────────────────────────────────────────────────────

const createWarehouse = [
  body('name').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('contactInfo').notEmpty().trim(),
  body('storageCapacity').isInt({ min: 1 }),
  body('operationalHours').notEmpty().trim(),
  validate,
  async (req, res, next) => {
    try {
      const warehouse = await warehouseRepo.create(req.tenantId, req.body);
      return successResponse(res, warehouse, 'Warehouse created', 201);
    } catch (err) { next(err); }
  },
];

const updateWarehouseRules = [
  body('name').optional().notEmpty().trim(),
  body('address').optional().notEmpty().trim(),
  body('contactInfo').optional().notEmpty().trim(),
  body('storageCapacity').optional().isInt({ min: 1 }),
  body('operationalHours').optional().notEmpty().trim(),
];

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouseRepo.findAll(req.tenantId);
    return successResponse(res, warehouses);
  } catch (err) { next(err); }
};

const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await warehouseRepo.findById(req.tenantId, req.params.id);
    if (!warehouse) return errorResponse(res, 'Warehouse not found', 404);
    return successResponse(res, warehouse);
  } catch (err) { next(err); }
};

const updateWarehouse = [
  ...updateWarehouseRules,
  validate,
  async (req, res, next) => {
    try {
      await warehouseRepo.update(req.tenantId, req.params.id, req.body);
      const updated = await warehouseRepo.findById(req.tenantId, req.params.id);
      return successResponse(res, updated, 'Warehouse updated');
    } catch (err) { next(err); }
  },
];

const deleteWarehouse = async (req, res, next) => {
  try {
    await warehouseRepo.remove(req.tenantId, req.params.id);
    return successResponse(res, null, 'Warehouse deleted');
  } catch (err) { next(err); }
};

// ─── LOCATIONS ─────────────────────────────────────────────────────────

const createLocation = [
  body('name').notEmpty().trim(),
  body('warehouseId').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const location = await locationRepo.create(req.tenantId, req.body);
      return successResponse(res, location, 'Location created', 201);
    } catch (err) { next(err); }
  },
];

const getLocations = async (req, res, next) => {
  try {
    const locations = await locationRepo.findAll(req.tenantId, req.query.warehouseId);
    return successResponse(res, locations);
  } catch (err) { next(err); }
};

const getLocationById = async (req, res, next) => {
  try {
    const location = await locationRepo.findById(req.tenantId, req.params.id);
    if (!location) return errorResponse(res, 'Location not found', 404);
    return successResponse(res, location);
  } catch (err) { next(err); }
};

const updateLocation = async (req, res, next) => {
  try {
    await locationRepo.update(req.tenantId, req.params.id, req.body);
    const updated = await locationRepo.findById(req.tenantId, req.params.id);
    return successResponse(res, updated, 'Location updated');
  } catch (err) { next(err); }
};

const deleteLocation = async (req, res, next) => {
  try {
    await locationRepo.remove(req.tenantId, req.params.id);
    return successResponse(res, null, 'Location deleted');
  } catch (err) { next(err); }
};

module.exports = {
  createWarehouse, getWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse,
  createLocation, getLocations, getLocationById, updateLocation, deleteLocation,
};
