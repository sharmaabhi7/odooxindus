const prisma = require('../database/prisma');

/**
 * Location Repository
 */
const create = (tenantId, data) =>
  prisma.location.create({ data: { tenantId, ...data } });

const findAll = (tenantId, warehouseId) => {
  const where = { tenantId };
  if (warehouseId) where.warehouseId = warehouseId;
  return prisma.location.findMany({ where, include: { warehouse: true }, orderBy: { name: 'asc' } });
};

const findById = (tenantId, id) =>
  prisma.location.findFirst({ where: { id, tenantId }, include: { warehouse: true } });

const update = (tenantId, id, data) =>
  prisma.location.updateMany({ where: { id, tenantId }, data });

const remove = (tenantId, id) =>
  prisma.location.deleteMany({ where: { id, tenantId } });

module.exports = { create, findAll, findById, update, remove };
