const express = require('express');
const service = require('../services/ticketService');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function presentTicket(ticket) {
  if (!ticket) return ticket;

  return {
    ...ticket,
    customer_phone: ticket.customer_phone
      ? `${ticket.customer_phone.slice(0, 3)}****${ticket.customer_phone.slice(-3)}`
      : ticket.customer_phone,
  };
}

// GET /api/tickets
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const tickets = await service.list({
      limit: req.query.limit === undefined ? 50 : req.query.limit,
      offset: req.query.offset === undefined ? 0 : req.query.offset,
    }, req.auth);

    res.json({ data: tickets.map(presentTicket) });
  })
);

// GET /api/tickets/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const ticket = await service.getById(req.params.id, req.auth);
    res.json({ data: presentTicket(ticket) });
  })
);

// POST /api/tickets
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const ticket = await service.create(req.body, req.auth);

    res.status(201).json({
      ticket_id: ticket.ticket_id,
      ticket_code: ticket.ticket_code,
      status: ticket.status,
      category_id: ticket.category_id,
      received_at: ticket.received_at,
      due_date: ticket.due_date,
    });
  })
);

// PUT /api/tickets/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const ticket = await service.update(
      req.params.id,
      req.body,
      req.auth
    );
    res.json({ data: presentTicket(ticket) });
  })
);

// DELETE /api/tickets/:id
// Hủy phiếu theo nghiệp vụ, không xóa hồ sơ khỏi database.
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const ticket = await service.cancel(req.params.id, req.auth);
    res.json({
      message: 'Hủy phiếu bảo hành thành công.',
      data: presentTicket(ticket),
    });
  })
);

module.exports = router;
