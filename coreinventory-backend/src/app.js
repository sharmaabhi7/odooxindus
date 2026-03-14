require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const transferRoutes = require('./routes/transferRoutes');
const stockRoutes = require('./routes/stockRoutes');
const miscRoutes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health check & Welcome ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CoreInventory API', docs: '/api/v1', health: '/health' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CoreInventory API', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/suppliers`, supplierRoutes);
app.use(`${API}/stock`, stockRoutes);
app.use(`${API}/receipts`, receiptRoutes);
app.use(`${API}/deliveries`, deliveryRoutes);
app.use(`${API}/transfers`, transferRoutes);
app.use(`${API}`, warehouseRoutes);  // /warehouses and /locations live here
app.use(`${API}`, miscRoutes);       // /dashboard and /categories

// ─── Error Handling ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
