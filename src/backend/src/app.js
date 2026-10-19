const express = require('express');
const customerRoutes = require('./routes/customerRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
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

app.use('/api/customers', customerRoutes);
app.use('/api/tickets', ticketRoutes);

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
