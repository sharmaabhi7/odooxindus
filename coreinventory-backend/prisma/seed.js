require('dotenv').config();
const prisma = require('../src/database/prisma');
const bcrypt = require('bcryptjs');


async function main() {
  console.log('🌱 Seeding CoreInventory database...');

  // ── Create Demo Tenant ──────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      companyName: 'ACME Corporation',
      slug: 'acme-corp',
      plan: 'pro',
    },
  });
  console.log(`✅ Tenant: ${tenant.companyName} (${tenant.id})`);

  // ── Create Inventory Manager ────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 12);

  const manager = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'manager@acme.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Alice Manager',
      email: 'manager@acme.com',
      password: hashedPassword,
      role: 'inventory_manager',
    },
  });

  const staff = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'staff@acme.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Bob Staff',
      email: 'staff@acme.com',
      password: hashedPassword,
      role: 'warehouse_staff',
    },
  });
  console.log(`✅ Users: ${manager.email}, ${staff.email}`);

  // ── Categories ──────────────────────────────────────────────────────
  const [electronics, office] = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-elec-0001' },
      update: {},
      create: { id: 'cat-elec-0001', tenantId: tenant.id, name: 'Electronics' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-off-0001' },
      update: {},
      create: { id: 'cat-off-0001', tenantId: tenant.id, name: 'Office Supplies' },
    }),
  ]);
  console.log('✅ Categories seeded');

  // ── Warehouse & Locations ───────────────────────────────────────────
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'wh-main-0001' },
    update: {},
    create: {
      id: 'wh-main-0001',
      tenantId: tenant.id,
      name: 'Main Warehouse',
      address: '123 Industrial Road, Mumbai',
    },
  });

  const [rackA, rackB, packingZone] = await Promise.all([
    prisma.location.upsert({
      where: { id: 'loc-rack-a' },
      update: {},
      create: { id: 'loc-rack-a', tenantId: tenant.id, warehouseId: warehouse.id, name: 'Rack A', type: 'storage' },
    }),
    prisma.location.upsert({
      where: { id: 'loc-rack-b' },
      update: {},
      create: { id: 'loc-rack-b', tenantId: tenant.id, warehouseId: warehouse.id, name: 'Rack B', type: 'storage' },
    }),
    prisma.location.upsert({
      where: { id: 'loc-packing' },
      update: {},
      create: { id: 'loc-packing', tenantId: tenant.id, warehouseId: warehouse.id, name: 'Packing Zone', type: 'packing' },
    }),
  ]);
  console.log(`✅ Warehouse: ${warehouse.name} with ${3} locations`);

  // ── Suppliers ───────────────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { id: 'sup-tech-0001' },
    update: {},
    create: {
      id: 'sup-tech-0001',
      tenantId: tenant.id,
      name: 'TechSupply Co.',
      email: 'orders@techsupply.com',
      phone: '+91-9876543210',
    },
  });
  console.log('✅ Supplier seeded');

  // ── Products ────────────────────────────────────────────────────────
  const [laptop, keyboard, pen] = await Promise.all([
    prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'ELEC-001' } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Laptop 15"',
        sku: 'ELEC-001',
        categoryId: electronics.id,
        unit: 'pcs',
        reorderLevel: 5,
      },
    }),
    prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'ELEC-002' } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Mechanical Keyboard',
        sku: 'ELEC-002',
        categoryId: electronics.id,
        unit: 'pcs',
        reorderLevel: 10,
      },
    }),
    prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: 'OFF-001' } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: 'Ballpoint Pen (Box)',
        sku: 'OFF-001',
        categoryId: office.id,
        unit: 'box',
        reorderLevel: 20,
      },
    }),
  ]);
  console.log('✅ Products seeded');

  // ── Initial Stock ───────────────────────────────────────────────────
  await Promise.all([
    prisma.stock.upsert({
      where: { tenantId_productId_locationId: { tenantId: tenant.id, productId: laptop.id, locationId: rackA.id } },
      update: {},
      create: { tenantId: tenant.id, productId: laptop.id, locationId: rackA.id, quantity: 20 },
    }),
    prisma.stock.upsert({
      where: { tenantId_productId_locationId: { tenantId: tenant.id, productId: keyboard.id, locationId: rackA.id } },
      update: {},
      create: { tenantId: tenant.id, productId: keyboard.id, locationId: rackA.id, quantity: 3 },
    }),
    prisma.stock.upsert({
      where: { tenantId_productId_locationId: { tenantId: tenant.id, productId: pen.id, locationId: rackB.id } },
      update: {},
      create: { tenantId: tenant.id, productId: pen.id, locationId: rackB.id, quantity: 50 },
    }),
  ]);
  console.log('✅ Initial stock seeded (keyboard is below reorder level for testing)');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Tenant slug : acme-corp');
  console.log('  Manager     : manager@acme.com / password123');
  console.log('  Staff       : staff@acme.com / password123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
