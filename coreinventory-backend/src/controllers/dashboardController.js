const prisma = require('../database/prisma');
const { successResponse } = require('../utils/response');

/**
 * Dashboard KPIs for a tenant
 * All aggregation queries run in parallel via Promise.all for performance.
 */
const getDashboard = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { warehouseId } = req.query;

    const [
      totalProducts,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
      stockData,
      recentMovements,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId } }),

      prisma.receipt.count({
        where: { tenantId, status: { notIn: ['validated', 'cancelled'] } },
      }),

      prisma.delivery.count({
        where: { tenantId, status: { notIn: ['validated', 'cancelled'] } },
      }),

      prisma.transfer.count({
        where: { tenantId, status: { notIn: ['validated', 'cancelled'] } },
      }),

      // Raw SQL for stock aggregation with reorder level comparison
      prisma.$queryRaw`
        SELECT
          p.id,
          p.name,
          p.sku,
          p.reorder_level AS "reorderLevel",
          COALESCE(SUM(s.quantity), 0)::int AS "totalQty"
        FROM products p
        LEFT JOIN stock s ON s.product_id = p.id AND s.tenant_id = p.tenant_id
        WHERE p.tenant_id = ${tenantId}
        GROUP BY p.id, p.name, p.sku, p.reorder_level
      `,

      prisma.stockLedger.findMany({
        where: { tenantId },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          location: {
            include: { warehouse: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Calculate KPI counts
    const lowStockItems = stockData.filter(
      (p) => Number(p.totalQty) > 0 && Number(p.totalQty) <= Number(p.reorderLevel)
    );
    const outOfStockItems = stockData.filter((p) => Number(p.totalQty) === 0);

    // Optional warehouse filter on recent movements (in-memory)
    const filteredMovements = warehouseId
      ? recentMovements.filter((m) => m.location?.warehouse?.id === warehouseId)
      : recentMovements;

    return successResponse(res, {
      kpis: {
        totalProducts,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers,
      },
      lowStockItems,
      outOfStockItems,
      recentMovements: filteredMovements,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
