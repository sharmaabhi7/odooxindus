const transferRepo = require('../repositories/transferRepository');
const { moveStock } = require('./stockService');

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

  // Move each item (each is a single ACID transaction)
  for (const item of transfer.items) {
    try {
      await moveStock({
        tenantId,
        productId: item.productId,
        fromLocationId: transfer.sourceLocationId,
        toLocationId: transfer.destinationLocationId,
        quantity: item.quantity,
        referenceId: transferId,
      });
    } catch (err) {
      if (err.message.includes('Insufficient')) {
        const productName = item.product?.name || item.productId;
        const locationName = transfer.sourceLocation?.name || transfer.sourceLocationId;
        throw Object.assign(new Error(`Insufficient stock for "${productName}" at ${locationName}`), { statusCode: 400 });
      }
      throw err;
    }
  }

  return transferRepo.updateStatus(transferId, 'validated', {
    validatedAt: new Date(),
  });
};

module.exports = { createTransfer, getTransfers, getTransferById, validateTransfer };
