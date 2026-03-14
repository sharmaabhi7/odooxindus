const receiptRepo = require('../repositories/receiptRepository');
const { increaseStock, checkAndAlertLowStock } = require('./stockService');
const { sendReceiptConfirmation } = require('../email/emailService');
const prisma = require('../database/prisma');

/**
 * Create a draft receipt
 */
const createReceipt = async ({ tenantId, supplierId, items, notes, createdBy }) => {
  return receiptRepo.create(tenantId, { supplierId, items, notes, createdBy });
};

/**
 * Get paginated receipts for tenant
 */
const getReceipts = async (tenantId, query) => {
  const [receipts, total] = await Promise.all([
    receiptRepo.findAll(tenantId, query),
    receiptRepo.count(tenantId, query.status ? { status: query.status } : {}),
  ]);
  return { receipts, total };
};

/**
 * Get single receipt by ID (tenant-scoped)
 */
const getReceiptById = async (tenantId, id) => {
  const receipt = await receiptRepo.findById(tenantId, id);
  if (!receipt) throw Object.assign(new Error('Receipt not found'), { statusCode: 404 });
  return receipt;
};

/**
 * Validate a receipt -> INCREASES STOCK for each item
 * Sends confirmation email.
 * Checks low stock.
 */
const validateReceipt = async (tenantId, receiptId, createdBy) => {
  const receipt = await receiptRepo.findById(tenantId, receiptId);
  if (!receipt) throw Object.assign(new Error('Receipt not found'), { statusCode: 404 });
  if (receipt.status === 'validated') throw Object.assign(new Error('Receipt already validated'), { statusCode: 400 });
  if (receipt.status === 'cancelled') throw Object.assign(new Error('Cannot validate a cancelled receipt'), { statusCode: 400 });

  // Wrap all stock increases + status update in a single atomic transaction
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of receipt.items) {
      await increaseStock({
        tenantId,
        productId: item.productId,
        locationId: item.locationId,
        quantity: item.quantity,
        movementType: 'receipt',
        referenceId: receiptId,
      }, tx);
    }

    // Update receipt status inside the same transaction
    return tx.receipt.update({
      where: { id: receiptId },
      data: { status: 'validated', validatedAt: new Date() },
    });
  });

  // Fire emails (non-blocking, outside transaction)
  const creator = await prisma.user.findUnique({ where: { id: createdBy } });
  if (creator?.email) {
    sendReceiptConfirmation({
      to: creator.email,
      receiptId,
      supplierName: receipt.supplier?.name,
      itemCount: receipt.items.length,
    });
  }

  // Trigger low stock check for managers
  const managers = await prisma.user.findMany({
    where: { tenantId, role: 'inventory_manager' },
    select: { email: true },
  });
  const managerEmails = managers.map((m) => m.email);
  checkAndAlertLowStock(tenantId, managerEmails).catch(console.error);

  return updated;
};

module.exports = { createReceipt, getReceipts, getReceiptById, validateReceipt };
