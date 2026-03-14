const { adjustStock } = require('../services/stockService');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');
const prisma = require('../database/prisma');

const createRules = [
  body('productId').notEmpty(),
  body('locationId').notEmpty(),
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

const getAll = async (req, res, next) => {
  try {
    const data = await prisma.adjustment.findMany({
      where: { tenantId: req.tenantId },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, data);
  } catch (err) { next(err); }
};

module.exports = { create, getAll };
