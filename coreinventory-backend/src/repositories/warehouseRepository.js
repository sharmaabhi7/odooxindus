const prisma = require('../database/prisma');

/**
 * Warehouse Repository
 */
const create = async (tenantId, data) => {
  try {
    return await prisma.warehouse.create({ data: { tenantId, ...data } });
  } catch (err) {
    if (err?.message?.includes('Unknown argument `contactInfo`')) {
      const created = await prisma.warehouse.create({
        data: {
          tenantId,
          name: data.name,
          address: data.address,
        },
      });
      await prisma.$executeRaw`
        UPDATE "warehouses"
        SET "contact_info" = ${data.contactInfo},
            "storage_capacity" = ${Number(data.storageCapacity)},
            "operational_hours" = ${data.operationalHours}
        WHERE "id" = ${created.id}
      `;
      return {
        ...created,
        contactInfo: data.contactInfo,
        storageCapacity: Number(data.storageCapacity),
        operationalHours: data.operationalHours,
      };
    }
    throw err;
  }
};

const findAll = (tenantId) =>
  prisma.warehouse.findMany({
    where: { tenantId },
    include: { locations: true },
    orderBy: { name: 'asc' },
  });

const findById = (tenantId, id) =>
  prisma.warehouse.findFirst({
    where: { id, tenantId },
    include: { locations: true },
  });

const update = async (tenantId, id, data) => {
  try {
    return await prisma.warehouse.updateMany({ where: { id, tenantId }, data });
  } catch (err) {
    if (err?.message?.includes('Unknown argument `contactInfo`')) {
      const baseData = {};
      if (typeof data.name !== 'undefined') baseData.name = data.name;
      if (typeof data.address !== 'undefined') baseData.address = data.address;
      if (Object.keys(baseData).length > 0) {
        await prisma.warehouse.updateMany({ where: { id, tenantId }, data: baseData });
      }
      if (
        typeof data.contactInfo !== 'undefined' ||
        typeof data.storageCapacity !== 'undefined' ||
        typeof data.operationalHours !== 'undefined'
      ) {
        await prisma.$executeRaw`
          UPDATE "warehouses"
          SET "contact_info" = COALESCE(${data.contactInfo}, "contact_info"),
              "storage_capacity" = COALESCE(${typeof data.storageCapacity === 'undefined' ? null : Number(data.storageCapacity)}, "storage_capacity"),
              "operational_hours" = COALESCE(${data.operationalHours}, "operational_hours")
          WHERE "id" = ${id} AND "tenant_id" = ${tenantId}
        `;
      }
      return { count: 1 };
    }
    throw err;
  }
};

const remove = (tenantId, id) =>
  prisma.warehouse.deleteMany({ where: { id, tenantId } });

module.exports = { create, findAll, findById, update, remove };
