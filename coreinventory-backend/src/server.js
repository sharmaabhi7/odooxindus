require('dotenv').config();
const app = require('./app');
const prisma = require('./database/prisma');
const { port } = require('./config');

const startServer = async () => {
  try {
    await prisma.$connect();
    await prisma.$executeRawUnsafe('ALTER TABLE "stock" ADD COLUMN IF NOT EXISTS "reserved_quantity" INTEGER NOT NULL DEFAULT 0');
    console.log('✅ Database connected');

    app.listen(port, () => {
      console.log(`🚀 CoreInventory API running on http://localhost:${port}`);
      console.log(`📖 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing DB connection...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
