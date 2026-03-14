const prisma = require('../database/prisma');

/**
 * Transfer Repository
 */
const create = (tenantId, data) =>
  prisma.transfer.create({
    data: {
      tenantId,
      sourceLocationId: data.sourceLocationId,
      destinationLocationId: data.destinationLocationId,
      createdBy: data.createdBy,
      notes: data.notes,
      items: {
        create: data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

const findAll = (tenantId, { status, skip = 0, take = 50 } = {}) => {
  const where = { tenantId };
  if (status) where.status = status;
  return prisma.transfer.findMany({
    where,
    include: {
      sourceLocation: { include: { warehouse: true } },
      destinationLocation: { include: { warehouse: true } },
      creator: { select: { id: true, name: true } },
      items: { include: { product: true } },
    },
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (tenantId, id) =>
  prisma.transfer.findFirst({
    where: { id, tenantId },
    include: {
      sourceLocation: { include: { warehouse: true } },
      destinationLocation: { include: { warehouse: true } },
      creator: { select: { id: true, name: true } },
      items: { include: { product: true } },
    },
  });

const updateStatus = (id, status, extra = {}) =>
  prisma.transfer.update({ where: { id }, data: { status, ...extra } });

const count = (tenantId, where = {}) =>
  prisma.transfer.count({ where: { tenantId, ...where } });

module.exports = { create, findAll, findById, updateStatus, count };
