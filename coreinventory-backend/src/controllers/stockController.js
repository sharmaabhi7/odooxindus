const stockRepo = require('../repositories/stockRepository');
const { successResponse } = require('../utils/response');
const prisma = require('../database/prisma');

const getAll = async (req, res, next) => {
  try {
    const { warehouseId, productId } = req.query;
    let stock;
    if (productId) {
      stock = await stockRepo.findByProduct(req.tenantId, productId);
    } else {
      stock = await stockRepo.findByTenant(req.tenantId);
    }
    return successResponse(res, stock);
  } catch (err) { next(err); }
};

const getByProduct = async (req, res, next) => {
  try {
    const stock = await stockRepo.findByProduct(req.tenantId, req.params.productId);
    return successResponse(res, stock);
  } catch (err) { next(err); }
};

const getLedger = async (req, res, next) => {
  try {
    const { productId, movementType, skip = 0, take = 50 } = req.query;
    const where = { tenantId: req.tenantId };
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;

    const [entries, total] = await Promise.all([
      prisma.stockLedger.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          location: { include: { warehouse: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      prisma.stockLedger.count({ where }),
    ]);

    return successResponse(res, { entries, total });
  } catch (err) { next(err); }
};

module.exports = { getAll, getByProduct, getLedger };
