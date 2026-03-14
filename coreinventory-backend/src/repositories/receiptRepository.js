const prisma = require('../database/prisma');

/**
 * Receipt Repository
 */
const create = (tenantId, data) =>
  prisma.receipt.create({
    data: {
      tenantId,
      supplierId: data.supplierId,
      createdBy: data.createdBy,
      notes: data.notes,
      items: {
        create: data.items.map((i) => ({
          productId: i.productId,
          locationId: i.locationId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true, supplier: true },
  });

const findAll = (tenantId, { status, skip = 0, take = 50 } = {}) => {
  const where = { tenantId };
  if (status) where.status = status;
  return prisma.receipt.findMany({
    where,
    include: { supplier: true, creator: { select: { id: true, name: true } }, items: { include: { product: true, location: true } } },
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (tenantId, id) =>
  prisma.receipt.findFirst({
    where: { id, tenantId },
    include: {
      supplier: true,
      creator: { select: { id: true, name: true } },
      items: { include: { product: true, location: { include: { warehouse: true } } } },
    },
  });

const updateStatus = (id, status, extra = {}) =>
  prisma.receipt.update({ where: { id }, data: { status, ...extra } });

const count = (tenantId, where = {}) =>
  prisma.receipt.count({ where: { tenantId, ...where } });

module.exports = { create, findAll, findById, updateStatus, count };
