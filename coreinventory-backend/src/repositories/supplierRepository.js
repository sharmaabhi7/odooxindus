const prisma = require('../database/prisma');

/**
 * Supplier Repository
 */
const create = (tenantId, data) =>
  prisma.supplier.create({ data: { tenantId, ...data } });

const findAll = (tenantId) =>
  prisma.supplier.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });

const findById = (tenantId, id) =>
  prisma.supplier.findFirst({ where: { id, tenantId } });

const update = (tenantId, id, data) =>
  prisma.supplier.updateMany({ where: { id, tenantId }, data });

const remove = (tenantId, id) =>
  prisma.supplier.deleteMany({ where: { id, tenantId } });

module.exports = { create, findAll, findById, update, remove };
