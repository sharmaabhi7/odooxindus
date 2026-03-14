const deliveryService = require('../services/deliveryService');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [
  body('customerName').notEmpty().trim(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.locationId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { customerName, items, notes } = req.body;
      const delivery = await deliveryService.createDelivery({
        tenantId: req.tenantId,
        customerName,
        items,
        notes,
        createdBy: req.user.id,
      });
      return successResponse(res, delivery, 'Delivery order created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const result = await deliveryService.getDeliveries(req.tenantId, req.query);
    return successResponse(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.tenantId, req.params.id);
    return successResponse(res, delivery);
  } catch (err) { next(err); }
};

const validate_ = async (req, res, next) => {
  try {
    const updated = await deliveryService.validateDelivery(req.tenantId, req.params.id, req.user.id);
    return successResponse(res, updated, 'Delivery validated — stock decremented');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, validate: validate_ };
