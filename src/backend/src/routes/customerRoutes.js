const express = require('express');
const service = require('../services/customerService');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function maskPhone(customer) {
  return {
    ...customer,
    phone: customer.phone
      ? `${customer.phone.slice(0, 3)}****${customer.phone.slice(-3)}`
      : customer.phone,
  };
}

// GET /api/customers?phone=0901234567
// GET /api/customers?limit=50&offset=0
router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.query.phone !== undefined) {
      const customer = await service.getByPhone(req.query.phone);
      return res.json({ data: maskPhone(customer) });
    }

    const data = await service.list({
      limit: req.query.limit === undefined ? 50 : req.query.limit,
      offset: req.query.offset === undefined ? 0 : req.query.offset,
    });

    return res.json({ data: data.map(maskPhone) });
  })
);

// GET /api/customers/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await service.getById(req.params.id);
    return res.json({ data: maskPhone(customer) });
  })
);

// POST /api/customers
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const customer = await service.create(req.body);
    return res.status(201).json({ data: maskPhone(customer) });
  })
);

// PUT /api/customers/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await service.update(req.params.id, req.body);
    return res.json({ data: maskPhone(customer) });
  })
);

// DELETE /api/customers/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await service.remove(req.params.id);
    return res.json({
      message: 'Xóa khách hàng thành công.',
      data: maskPhone(customer),
    });
  })
);

module.exports = router;
