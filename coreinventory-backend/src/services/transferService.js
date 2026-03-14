const transferRepo = require('../repositories/transferRepository');
const { moveStock } = require('./stockService');
const prisma = require('../database/prisma');

/**
 * Create a draft internal transfer
 */
const createTransfer = async ({ tenantId, sourceLocationId, destinationLocationId, items, notes, createdBy }) => {
  if (sourceLocationId === destinationLocationId) {
    throw Object.assign(new Error('Source and destination cannot be the same location'), { statusCode: 400 });
  }
  return transferRepo.create(tenantId, { sourceLocationId, destinationLocationId, items, notes, createdBy });
};

/**
 * Get paginated transfers
 */
const getTransfers = async (tenantId, query) => {
  const [transfers, total] = await Promise.all([
    transferRepo.findAll(tenantId, query),
    transferRepo.count(tenantId, query.status ? { status: query.status } : {}),
  ]);
  return { transfers, total };
};

/**
 * Get single transfer
 */
const getTransferById = async (tenantId, id) => {
  const transfer = await transferRepo.findById(tenantId, id);
  if (!transfer) throw Object.assign(new Error('Transfer not found'), { statusCode: 404 });
  return transfer;
};

/**
 * Validate a transfer -> MOVES STOCK from source to destination
 * Net stock is zero-sum (no total stock change)
 */
const validateTransfer = async (tenantId, transferId) => {
  const transfer = await transferRepo.findById(tenantId, transferId);
  if (!transfer) throw Object.assign(new Error('Transfer not found'), { statusCode: 404 });
  if (transfer.status === 'validated') throw Object.assign(new Error('Transfer already validated'), { statusCode: 400 });
  if (transfer.status === 'cancelled') throw Object.assign(new Error('Cannot validate a cancelled transfer'), { statusCode: 400 });

  // Wrap everything in a single atomic transaction
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of transfer.items) {
      try {
        await moveStock({
          tenantId,
          productId: item.productId,
          fromLocationId: transfer.sourceLocationId,
          toLocationId: transfer.destinationLocationId,
          quantity: item.quantity,
          referenceId: transferId,
        }, tx);
      } catch (err) {
        if (err.message.includes('Insufficient')) {
          const productName = item.product?.name || item.productId;
          const locationName = transfer.sourceLocation?.name || transfer.sourceLocationId;
          throw Object.assign(new Error(`Insufficient stock for "${productName}" at ${locationName}`), { statusCode: 400 });
        }
        throw err;
      }
    }

    // Update status inside the same transaction
    return tx.transfer.update({
      where: { id: transferId },
      data: { status: 'validated', validatedAt: new Date() },
    });
  });

  return updated;
};

module.exports = { createTransfer, getTransfers, getTransferById, validateTransfer };
