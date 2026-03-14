const supplierRepo = require('../repositories/supplierRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [body('name').notEmpty().trim()];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const supplier = await supplierRepo.create(req.tenantId, req.body);
      return successResponse(res, supplier, 'Supplier created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const suppliers = await supplierRepo.findAll(req.tenantId);
    return successResponse(res, suppliers);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const supplier = await supplierRepo.findById(req.tenantId, req.params.id);
    if (!supplier) return errorResponse(res, 'Supplier not found', 404);
    return successResponse(res, supplier);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await supplierRepo.update(req.tenantId, req.params.id, req.body);
    const updated = await supplierRepo.findById(req.tenantId, req.params.id);
    return successResponse(res, updated, 'Supplier updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await supplierRepo.remove(req.tenantId, req.params.id);
    return successResponse(res, null, 'Supplier deleted');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, update, remove };
