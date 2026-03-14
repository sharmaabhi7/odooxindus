const prisma = require('../database/prisma');

/**
 * Stock Repository
 */
const findByTenant = (tenantId) =>
  prisma.stock.findMany({
    where: { tenantId },
    include: {
      product: { include: { category: true } },
      location: { include: { warehouse: true } },
    },
    orderBy: [{ product: { name: 'asc' } }],
  });

const findByProduct = (tenantId, productId) =>
  prisma.stock.findMany({
    where: { tenantId, productId },
    include: { location: { include: { warehouse: true } } },
  });

const getTotalByProduct = (tenantId) =>
  prisma.stock.groupBy({
    by: ['productId'],
    where: { tenantId },
    _sum: { quantity: true },
  });

module.exports = { findByTenant, findByProduct, getTotalByProduct };
