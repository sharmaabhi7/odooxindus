const prisma = require('../database/prisma');
const { successResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

const create = [
  body('name').notEmpty().trim(),
  validate,
  async (req, res, next) => {
    try {
      const category = await prisma.category.create({
        data: { tenantId: req.tenantId, name: req.body.name },
      });
      return successResponse(res, category, 'Category created', 201);
    } catch (err) { next(err); }
  },
];

const getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, categories);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId },
    });
    if (!category) return successResponse(res, null, 'Category not found');
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name },
    });
    return successResponse(res, updated, 'Category updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.category.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
    return successResponse(res, null, 'Category deleted');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, update, remove };
