const prisma = require('../database/prisma');
const { sendLowStockAlert } = require('../email/emailService');

/**
 * Core Stock Service
 * ALL stock mutations run inside Prisma transactions to ensure ACID compliance.
 * Every stock change creates an immutable Ledger entry.
 */

/**
 * Upsert stock record (create if missing, update if exists)
 */
const _upsertStock = async (tx, { tenantId, productId, locationId, quantityDelta = 0, reservedDelta = 0 }) => {
  const existing = await tx.stock.findUnique({
    where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
  });

  if (existing) {
    const hasReservedQuantity = Object.prototype.hasOwnProperty.call(existing, 'reservedQuantity');
    const newQty = existing.quantity + quantityDelta;
    const currentReserved = hasReservedQuantity ? existing.reservedQuantity : 0;
    const newReserved = currentReserved + reservedDelta;

    if (newQty < 0) {
      throw Object.assign(new Error(`Insufficient stock for product ${productId} at location ${locationId}. Available: ${existing.quantity}, Requested: ${Math.abs(quantityDelta)}`), { statusCode: 400 });
    }

    if (newReserved < 0) {
      throw Object.assign(new Error(`Consistency error: Reserved quantity cannot be negative for product ${productId}`), { statusCode: 400 });
    }

    if (!hasReservedQuantity && reservedDelta !== 0) {
      throw Object.assign(new Error('Reserved stock operations require an up-to-date Prisma client. Run prisma generate and restart the server.'), { statusCode: 500 });
    }

    const data = {
      quantity: newQty,
    };
    if (hasReservedQuantity) data.reservedQuantity = newReserved;

    return tx.stock.update({
      where: { id: existing.id },
      data,
    });
  } else {
    if (quantityDelta < 0 || reservedDelta < 0) {
      throw Object.assign(new Error(`Insufficient initial stock for product ${productId} at location ${locationId}`), { statusCode: 400 });
    }
    const createData = {
      tenantId,
      productId,
      locationId,
      quantity: quantityDelta,
    };

    if (reservedDelta !== 0) {
      try {
        return tx.stock.create({
          data: {
            ...createData,
            reservedQuantity: reservedDelta,
          },
        });
      } catch (err) {
        if (err?.message?.includes('Unknown argument `reservedQuantity`')) {
          throw Object.assign(new Error('Reserved stock operations require an up-to-date Prisma client. Run prisma generate and restart the server.'), { statusCode: 500 });
        }
        throw err;
      }
    }

    return tx.stock.create({
      data: createData,
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

const increaseStock = async ({ tenantId, productId, locationId, quantity, movementType, referenceId }, tx) => {
  // If already inside a transaction, use the provided client directly (avoid nested transactions)
  if (tx) {
    const stock = await _upsertStock(tx, { tenantId, productId, locationId, quantityDelta: quantity });
    await _writeLedger(tx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: quantity });
    return stock;
  }
  // No outer transaction — create one
  return prisma.$transaction(async (pTx) => {
    const stock = await _upsertStock(pTx, { tenantId, productId, locationId, quantityDelta: quantity });
    await _writeLedger(pTx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: quantity });
    return stock;
  });
};

/**
 * Decrease stock
 */
const decreaseStock = async ({ tenantId, productId, locationId, quantity, movementType, referenceId }, tx) => {
  // If already inside a transaction, use the provided client directly (avoid nested transactions)
  if (tx) {
    const stock = await _upsertStock(tx, { tenantId, productId, locationId, quantityDelta: -quantity });
    await _writeLedger(tx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: -quantity });
    return stock;
  }
  // No outer transaction — create one
  return prisma.$transaction(async (pTx) => {
    const stock = await _upsertStock(pTx, { tenantId, productId, locationId, quantityDelta: -quantity });
    await _writeLedger(pTx, { tenantId, productId, locationId, movementType, referenceId, quantityChange: -quantity });
    return stock;
  });
};

/**
 * Reserve stock (increase reservedQuantity, does not change main quantity)
 */
const reserveStock = async ({ tenantId, productId, locationId, quantity }, tx) => {
  if (tx) {
    return _upsertStock(tx, { tenantId, productId, locationId, reservedDelta: quantity });
  }
  return prisma.$transaction((pTx) => _upsertStock(pTx, { tenantId, productId, locationId, reservedDelta: quantity }));
};

/**
 * Release stock (decrease reservedQuantity)
 */
const releaseStock = async ({ tenantId, productId, locationId, quantity }, tx) => {
  if (tx) {
    return _upsertStock(tx, { tenantId, productId, locationId, reservedDelta: -quantity });
  }
  return prisma.$transaction((pTx) => _upsertStock(pTx, { tenantId, productId, locationId, reservedDelta: -quantity }));
};

/**
 * Move stock between locations (e.g., Internal Transfer)
 * Both ledger entries created in a single transaction - zero sum.
 */
const moveStock = async ({ tenantId, productId, fromLocationId, toLocationId, quantity, referenceId }, tx) => {
  const _run = async (client) => {
    // Deduct from source
    await _upsertStock(client, { tenantId, productId, locationId: fromLocationId, quantityDelta: -quantity });
    await _writeLedger(client, {
      tenantId, productId, locationId: fromLocationId,
      movementType: 'transfer_out', referenceId, quantityChange: -quantity,
    });

    // Add to destination
    await _upsertStock(client, { tenantId, productId, locationId: toLocationId, quantityDelta: quantity });
    await _writeLedger(client, {
      tenantId, productId, locationId: toLocationId,
      movementType: 'transfer_in', referenceId, quantityChange: quantity,
    });
  };

  if (tx) {
    // Already in a transaction — run directly
    return _run(tx);
  }
  // No outer transaction — create one
  return prisma.$transaction((innerTx) => _run(innerTx));
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

/**
 * Get aggregated stock view for all products (On Hand vs Free to Use)
 */
const getStockView = async (tenantId) => {
  return prisma.$queryRaw`
    SELECT 
      p.id, 
      p.name, 
      p.sku, 
      p.unit,
      p.reorder_level AS "reorderLevel",
      c.name AS "categoryName",
      COALESCE(SUM(s.quantity), 0)::int AS "onHand",
      COALESCE(SUM(s.reserved_quantity), 0)::int AS "reserved",
      (COALESCE(SUM(s.quantity), 0) - COALESCE(SUM(s.reserved_quantity), 0))::int AS "freeToUse"
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN stock s ON s.product_id = p.id AND s.tenant_id = ${tenantId}
    WHERE p.tenant_id = ${tenantId}
    GROUP BY p.id, p.name, p.sku, p.unit, p.reorder_level, c.name
    ORDER BY p.name ASC
  `;
};

/**
 * Get full move history (Ledger)
 */
const getMoveHistory = async (tenantId, query = {}) => {
  const { productId, locationId, movementType, skip = 0, take = 50 } = query;
  
  return prisma.stockLedger.findMany({
    where: {
      tenantId,
      productId: productId || undefined,
      locationId: locationId || undefined,
      movementType: movementType || undefined,
    },
    select: {
      id: true,
      movementType: true,
      referenceId: true,
      quantityChange: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          sku: true
        }
      },
      location: { 
        select: { 
          name: true,
          warehouse: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: Number(skip),
    take: Number(take),
  });
};

module.exports = { 
  increaseStock, 
  decreaseStock, 
  moveStock, 
  adjustStock, 
  reserveStock, 
  releaseStock, 
  checkAndAlertLowStock,
  getStockView,
  getMoveHistory
};
