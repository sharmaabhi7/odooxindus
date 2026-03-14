const prisma = require('../database/prisma');

/**
 * Product Repository - All queries are tenant-scoped
 */

const create = (tenantId, data) =>
  prisma.product.create({ data: { tenantId, ...data } });

const findAll = (tenantId, { search, categoryId, skip = 0, take = 50 } = {}) => {
  const where = { tenantId };
  if (categoryId) where.categoryId = categoryId;
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { sku: { contains: search, mode: 'insensitive' } },
  ];
  return prisma.product.findMany({
    where,
    include: { category: true },
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (tenantId, id) =>
  prisma.product.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      stock: { include: { location: { include: { warehouse: true } } } },
    },
  });

const update = (tenantId, id, data) =>
  prisma.product.updateMany({ where: { id, tenantId }, data });

const remove = (tenantId, id) =>
  prisma.product.deleteMany({ where: { id, tenantId } });

const count = (tenantId, where = {}) =>
  prisma.product.count({ where: { tenantId, ...where } });

module.exports = { create, findAll, findById, update, remove, count };
