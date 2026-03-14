const transferService = require('../services/transferService');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [
  body('sourceLocationId').notEmpty(),
  body('destinationLocationId').notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { sourceLocationId, destinationLocationId, items, notes } = req.body;
      const transfer = await transferService.createTransfer({
        tenantId: req.tenantId,
        sourceLocationId,
        destinationLocationId,
        items,
        notes,
        createdBy: req.user.id,
      });
      return successResponse(res, transfer, 'Transfer created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const result = await transferService.getTransfers(req.tenantId, req.query);
    return successResponse(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const transfer = await transferService.getTransferById(req.tenantId, req.params.id);
    return successResponse(res, transfer);
  } catch (err) { next(err); }
};

const validate_ = async (req, res, next) => {
  try {
    const updated = await transferService.validateTransfer(req.tenantId, req.params.id);
    return successResponse(res, updated, 'Transfer validated — stock moved');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, validate: validate_ };
