const prisma = require('../database/prisma');

/**
 * Product Repository - All queries are tenant-scoped
 */

const create = (tenantId, data, tx) => {
  const client = tx || prisma;
  return client.product.create({ data: { tenantId, ...data } });
};

const findAll = async (tenantId, { search, categoryId, skip = 0, take = 50 } = {}) => {
  const where = { tenantId };
  if (categoryId) where.categoryId = categoryId;
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { sku: { contains: search, mode: 'insensitive' } },
  ];
  
  const products = await prisma.product.findMany({
    where,
    include: { 
      category: true,
      stock: {
        select: { quantity: true }
      }
    },
    skip: Number(skip),
    take: Number(take),
    orderBy: { createdAt: 'desc' },
  });

  // Calculate total stock for each product
  return products.map(p => ({
    ...p,
    stock: p.stock.reduce((sum, s) => sum + s.quantity, 0)
  }));
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

const remove = async (tenantId, id) => {
  return prisma.$transaction(async (tx) => {
    // Delete minor dependent records that aren't critical history
    await tx.stock.deleteMany({ where: { tenantId, productId: id } });
    await tx.stockLedger.deleteMany({ where: { tenantId, productId: id } });
    await tx.adjustment.deleteMany({ where: { tenantId, productId: id } });
    
    // Attempt to delete product
    // Note: If linked to Receipts/Deliveries, this will still throw a foreign key error
    // which is the desired behavior for data integrity.
    return tx.product.delete({ where: { id, tenantId } });
  });
};

const count = (tenantId, where = {}) =>
  prisma.product.count({ where: { tenantId, ...where } });

module.exports = { create, findAll, findById, update, remove, count };
