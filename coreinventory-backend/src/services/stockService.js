const prisma = require('../database/prisma');
const { sendLowStockAlert } = require('../email/emailService');

/**
 * Core Stock Service
 * ALL stock mutations run inside Prisma transactions to ensure ACID compliance.
 * Every stock change creates an immutable Ledger entry.
 */

/**
 * Upsert stock record (create if missing, update if exists)
 * Used internally by all stock operations.
 */
const _upsertStock = async (tx, { tenantId, productId, locationId, delta }) => {
  // Lock the row by reading it first (serialized within the transaction)
  const existing = await tx.stock.findUnique({
    where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
  });

  if (existing) {
    const newQty = existing.quantity + delta;
    if (newQty < 0) {
      throw new Error(`Insufficient stock for product ${productId} at location ${locationId}. Available: ${existing.quantity}, Requested: ${Math.abs(delta)}`);
    }
    return tx.stock.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    if (delta < 0) {
      throw new Error(`No stock exists for product ${productId} at location ${locationId}`);
    }
    return tx.stock.create({
      data: { tenantId, productId, locationId, quantity: delta },
    });
  }
};

/**
 * Write a Stock Ledger entry (immutable audit trail)
 */
const _writeLedger = async (tx, { tenantId, productId, locationId, movementType, referenceId, quantityChange }) => {
  return tx.stockLedger.create({
    data: {
      tenantId,
      productId,
      locationId,
      movementType,
      referenceId,
      quantityChange,
    },
  });
};

/**
 * Increase stock (e.g., on Receipt validation)
 */
const increaseStock = async ({ tenantId, productId, locationId, quantity, movementType, referenceId }) => {
  return prisma.$transaction(async (tx) => {
    const stock = await _upsertStock(tx, { tenantId, productId, locationId, delta: quantity });
    await _writeLedger(tx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: quantity });
    return stock;
  });
};

/**
 * Decrease stock (e.g., on Delivery validation)
 */
const decreaseStock = async ({ tenantId, productId, locationId, quantity, movementType, referenceId }) => {
  return prisma.$transaction(async (tx) => {
    const stock = await _upsertStock(tx, { tenantId, productId, locationId, delta: -quantity });
    await _writeLedger(tx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: -quantity });
    return stock;
  });
};

/**
 * Move stock between locations (e.g., Internal Transfer)
 * Both ledger entries created in a single transaction - zero sum.
 */
const moveStock = async ({ tenantId, productId, fromLocationId, toLocationId, quantity, referenceId }) => {
  return prisma.$transaction(async (tx) => {
    // Deduct from source
    await _upsertStock(tx, { tenantId, productId, locationId: fromLocationId, delta: -quantity });
    await _writeLedger(tx, {
      tenantId, productId, locationId: fromLocationId,
      movementType: 'transfer_out', referenceId, quantityChange: -quantity,
    });

    // Add to destination
    await _upsertStock(tx, { tenantId, productId, locationId: toLocationId, delta: quantity });
    await _writeLedger(tx, {
      tenantId, productId, locationId: toLocationId,
      movementType: 'transfer_in', referenceId, quantityChange: quantity,
    });
  });
};

/**
 * Overwrite stock (e.g., Stock Adjustment)
 * Returns delta (can be positive or negative)
 */
const adjustStock = async ({ tenantId, productId, locationId, newQty, reason, createdBy }) => {
  return prisma.$transaction(async (tx) => {
    // Get current stock
    const current = await tx.stock.findUnique({
      where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
    });

    const previousQty = current ? current.quantity : 0;
    const delta = newQty - previousQty;

    // Save adjustment record
    const adjustment = await tx.adjustment.create({
      data: { tenantId, productId, locationId, previousQty, newQty, reason, createdBy },
    });

    // Upsert the stock to new value
    if (current) {
      await tx.stock.update({ where: { id: current.id }, data: { quantity: newQty } });
    } else {
      await tx.stock.create({ data: { tenantId, productId, locationId, quantity: newQty } });
    }

    // Log in ledger
    await _writeLedger(tx, {
      tenantId, productId, locationId,
      movementType: 'adjustment', referenceId: adjustment.id, quantityChange: delta,
    });

    return { adjustment, delta };
  });
};

/**
 * Check for low stock and trigger alert emails
 */
const checkAndAlertLowStock = async (tenantId, managerEmails) => {
  const lowStockItems = await prisma.$queryRaw`
    SELECT p.id, p.name, p.sku, p.reorder_level AS "reorderLevel",
           COALESCE(SUM(s.quantity), 0) AS quantity
    FROM products p
    LEFT JOIN stock s ON s.product_id = p.id AND s.tenant_id = ${tenantId}
    WHERE p.tenant_id = ${tenantId}
    GROUP BY p.id, p.name, p.sku, p.reorder_level
    HAVING COALESCE(SUM(s.quantity), 0) <= p.reorder_level
  `;

  if (lowStockItems.length > 0 && managerEmails.length > 0) {
    await sendLowStockAlert({ to: managerEmails.join(','), products: lowStockItems });
  }

  return lowStockItems;
};

module.exports = { increaseStock, decreaseStock, moveStock, adjustStock, checkAndAlertLowStock };
