const prisma = require('../database/prisma');

/**
 * Warehouse Repository
 */
const create = (tenantId, data) =>
  prisma.warehouse.create({ data: { tenantId, ...data } });

const findAll = (tenantId) =>
  prisma.warehouse.findMany({
    where: { tenantId },
    include: { locations: true },
    orderBy: { name: 'asc' },
  });

const findById = (tenantId, id) =>
  prisma.warehouse.findFirst({
    where: { id, tenantId },
    include: { locations: true },
  });

const update = (tenantId, id, data) =>
  prisma.warehouse.updateMany({ where: { id, tenantId }, data });

const remove = (tenantId, id) =>
  prisma.warehouse.deleteMany({ where: { id, tenantId } });

module.exports = { create, findAll, findById, update, remove };
