const prisma = require('../database/prisma');

/**
 * Delivery Repository
 */
const create = (tenantId, data) =>
  prisma.delivery.create({
    data: {
      tenantId,
      customerName: data.customerName,
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
    include: { items: true },
  });

const findAll = (tenantId, { status, skip = 0, take = 50 } = {}) => {
  const where = { tenantId };
  if (status) where.status = status;
  return prisma.delivery.findMany({
    where,
    include: { creator: { select: { id: true, name: true } }, items: { include: { product: true, location: true } } },
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (tenantId, id) =>
  prisma.delivery.findFirst({
    where: { id, tenantId },
    include: {
      creator: { select: { id: true, name: true } },
      items: { include: { product: true, location: { include: { warehouse: true } } } },
    },
  });

const updateStatus = (id, status, extra = {}) =>
  prisma.delivery.update({ where: { id }, data: { status, ...extra } });

const count = (tenantId, where = {}) =>
  prisma.delivery.count({ where: { tenantId, ...where } });

module.exports = { create, findAll, findById, updateStatus, count };
