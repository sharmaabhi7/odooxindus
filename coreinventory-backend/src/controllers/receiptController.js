const receiptService = require('../services/receiptService');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.productId').isUUID(),
  body('items.*.locationId').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { supplierId, items, notes } = req.body;
      const receipt = await receiptService.createReceipt({
        tenantId: req.tenantId,
        supplierId,
        items,
        notes,
        createdBy: req.user.id,
      });
      return successResponse(res, receipt, 'Receipt created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const { status, skip, take } = req.query;
    const result = await receiptService.getReceipts(req.tenantId, { status, skip, take });
    return successResponse(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptById(req.tenantId, req.params.id);
    return successResponse(res, receipt);
  } catch (err) { next(err); }
};

const validate_ = async (req, res, next) => {
  try {
    const updated = await receiptService.validateReceipt(req.tenantId, req.params.id, req.user.id);
    return successResponse(res, updated, 'Receipt validated — stock updated');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, validate: validate_ };
