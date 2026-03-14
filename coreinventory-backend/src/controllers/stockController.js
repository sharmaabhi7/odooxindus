const stockService = require('../services/stockService');
const stockRepo = require('../repositories/stockRepository');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await stockService.getStockView(req.tenantId);
    return successResponse(res, data);
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
    const entries = await stockService.getMoveHistory(req.tenantId, req.query);
    return successResponse(res, entries);
  } catch (err) { next(err); }
};

module.exports = { getAll, getByProduct, getLedger };
