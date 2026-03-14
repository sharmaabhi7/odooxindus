const { adjustStock } = require('../services/stockService');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [
  body('productId').isUUID(),
  body('locationId').isUUID(),
  body('newQty').isInt({ min: 0 }),
  body('reason').notEmpty().trim(),
];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { productId, locationId, newQty, reason } = req.body;
      const result = await adjustStock({
        tenantId: req.tenantId,
        productId,
        locationId,
        newQty,
        reason,
        createdBy: req.user.id,
      });
      return successResponse(res, result, `Stock adjusted by ${result.delta > 0 ? '+' : ''}${result.delta}`, 201);
    } catch (err) { next(err); }
  },
];

module.exports = { create };
