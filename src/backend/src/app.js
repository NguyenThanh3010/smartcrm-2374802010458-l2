const express = require('express');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const requireAuth = require('./auth/authMiddleware');
const errorHandler = require('./errors/errorHandler');

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'Smart CRM API',
    module: 'L02 - Tiếp nhận và phân loại yêu cầu bảo hành',
    status: 'OK',
  });
});

// Dang nhap la endpoint cong khai.
app.use('/api/auth', authRoutes);

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
