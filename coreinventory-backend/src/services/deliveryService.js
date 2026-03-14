const deliveryRepo = require('../repositories/deliveryRepository');
const { decreaseStock, checkAndAlertLowStock } = require('./stockService');
const { sendDeliveryConfirmation } = require('../email/emailService');
const prisma = require('../database/prisma');

/**
 * Create a draft delivery order
 */
const createDelivery = async ({ tenantId, customerName, items, notes, createdBy }) => {
  return deliveryRepo.create(tenantId, { customerName, items, notes, createdBy });
};

/**
 * Get paginated deliveries
 */
const getDeliveries = async (tenantId, query) => {
  const [deliveries, total] = await Promise.all([
    deliveryRepo.findAll(tenantId, query),
    deliveryRepo.count(tenantId, query.status ? { status: query.status } : {}),
  ]);
  return { deliveries, total };
};

/**
 * Get single delivery by ID
 */
const getDeliveryById = async (tenantId, id) => {
  const delivery = await deliveryRepo.findById(tenantId, id);
  if (!delivery) throw Object.assign(new Error('Delivery not found'), { statusCode: 404 });
  return delivery;
};

/**
 * Validate a delivery -> DECREASES STOCK for each item
 * If insufficient stock, entire operation fails.
 */
const validateDelivery = async (tenantId, deliveryId, createdBy) => {
  const delivery = await deliveryRepo.findById(tenantId, deliveryId);
  if (!delivery) throw Object.assign(new Error('Delivery not found'), { statusCode: 404 });
  if (delivery.status === 'validated') throw Object.assign(new Error('Delivery already validated'), { statusCode: 400 });
  if (delivery.status === 'cancelled') throw Object.assign(new Error('Cannot validate a cancelled delivery'), { statusCode: 400 });

  // Decrease stock for each item - will throw if insufficient stock
  for (const item of delivery.items) {
    try {
      await decreaseStock({
        tenantId,
        productId: item.productId,
        locationId: item.locationId,
        quantity: item.quantity,
        movementType: 'delivery',
        referenceId: deliveryId,
      });
    } catch (err) {
      if (err.message.includes('Insufficient')) {
        const productName = item.product?.name || item.productId;
        const locationName = item.location?.name || item.locationId;
        throw Object.assign(new Error(`Insufficient stock for "${productName}" at ${locationName}`), { statusCode: 400 });
      }
      throw err;
    }
  }

  const updated = await deliveryRepo.updateStatus(deliveryId, 'validated', {
    validatedAt: new Date(),
  });

  // Send confirmation email (non-blocking)
  const creator = await prisma.user.findUnique({ where: { id: createdBy } });
  if (creator?.email) {
    sendDeliveryConfirmation({
      to: creator.email,
      deliveryId,
      customerName: delivery.customerName,
      itemCount: delivery.items.length,
    });
  }

  // Trigger low stock check after dispatch
  const managers = await prisma.user.findMany({
    where: { tenantId, role: 'inventory_manager' },
    select: { email: true },
  });
  checkAndAlertLowStock(tenantId, managers.map((m) => m.email)).catch(console.error);

  return updated;
};

module.exports = { createDelivery, getDeliveries, getDeliveryById, validateDelivery };
