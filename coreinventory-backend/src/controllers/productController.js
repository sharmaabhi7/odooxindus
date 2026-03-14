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

const prisma = require('../database/prisma');
const { increaseStock } = require('../services/stockService');

const create = [
  ...createRules,
  validate,
  async (req, res, next) => {
    try {
      const { name, sku, categoryId, unit, reorderLevel, initialQuantity, initialLocationId } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const product = await productRepo.create(req.tenantId, { 
          name, 
          sku, 
          categoryId: categoryId || null, 
          unit, 
          reorderLevel 
        }, tx);

        if (Number(initialQuantity) > 0 && initialLocationId) {
          await increaseStock({
            tenantId: req.tenantId,
            productId: product.id,
            locationId: initialLocationId,
            quantity: Number(initialQuantity),
            movementType: 'adjustment',
            referenceId: 'initial_stock'
          }, tx);
        }
        return product;
      });

      return successResponse(res, result, 'Product created', 201);
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
      const filteredData = {};
      if (name !== undefined) filteredData.name = name;
      if (sku !== undefined) filteredData.sku = sku;
      if (categoryId !== undefined) filteredData.categoryId = categoryId || null;
      if (unit !== undefined) filteredData.unit = unit;
      if (reorderLevel !== undefined) filteredData.reorderLevel = Number(reorderLevel);

      await productRepo.update(req.tenantId, req.params.id, filteredData);
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
