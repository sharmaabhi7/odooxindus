const productRepo = require('../repositories/productRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const createRules = [
  body('name').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('unit').notEmpty(),
  body('reorderLevel').isInt({ min: 0 }),
];

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { name, sku, categoryId, unit, reorderLevel } = req.body;
      const product = await productRepo.create(req.tenantId, { name, sku, categoryId, unit, reorderLevel });
      return successResponse(res, product, 'Product created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const { search, categoryId, skip, take } = req.query;
    const products = await productRepo.findAll(req.tenantId, { search, categoryId, skip, take });
    const total = await productRepo.count(req.tenantId, categoryId ? { categoryId } : {});
    return successResponse(res, { products, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const product = await productRepo.findById(req.tenantId, req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, product);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { name, sku, categoryId, unit, reorderLevel } = req.body;
    await productRepo.update(req.tenantId, req.params.id, { name, sku, categoryId, unit, reorderLevel });
    const updated = await productRepo.findById(req.tenantId, req.params.id);
    return successResponse(res, updated, 'Product updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await productRepo.remove(req.tenantId, req.params.id);
    return successResponse(res, null, 'Product deleted');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, update, remove };
