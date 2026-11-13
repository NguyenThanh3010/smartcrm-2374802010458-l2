const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const requireAuth = require('./auth/authMiddleware');
const requireAdmin = require('./auth/adminMiddleware');
const errorHandler = require('./errors/errorHandler');
const helmet = require('helmet');
const { pool } = require('./db');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'Smart CRM API',
    module: 'L02 - Tiếp nhận và phân loại yêu cầu bảo hành',
    status: 'OK',
  });
});

// Health check cho Docker.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    return res.status(200).json({
      status: 'OK',
      database: 'connected',
    });
  } catch {
    return res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
    });
  }
});

// Dang nhap la endpoint cong khai.
app.use('/api/auth', authRoutes);
// Chi ADMIN duoc phep tao tai khoan nhan vien.
app.use('/api/users', requireAuth, requireAdmin, userRoutes);

// Cac API nghiep vu yeu cau Bearer token hop le.
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/tickets', requireAuth, ticketRoutes);
app.use('/api/lookups', requireAuth, lookupRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Không tìm thấy endpoint.',
    },
  });
});

app.use(errorHandler);

module.exports = app;
