const { pool } = require('../db');
const { decryptValue } = require('../security/customerCrypto');

const SELECT_TICKET = `
  SELECT
    t.ticket_id,
    t.created_by,
    t.ticket_code,
    t.customer_id,
    t.device_id,
    t.center_id,
    t.category_id,
    t.issue_desc,
    t.priority,
    t.status,
    t.received_at,
    t.due_date,
    t.accessories,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    d.serial_no,
    d.purchase_date,
    d.warranty_months,
    ic.category_code,
    ic.category_name,
    sc.center_name
  FROM ticket t
  JOIN customer c ON c.customer_id = t.customer_id
  JOIN device d ON d.device_id = t.device_id
  JOIN issue_category ic ON ic.category_id = t.category_id
  JOIN service_center sc ON sc.center_id = t.center_id
`;

function decryptTicketCustomer(ticket) {
  if (!ticket) return null;

  return {
    ...ticket,
    customer_name: decryptValue(ticket.customer_name),
    customer_phone: decryptValue(ticket.customer_phone),
  };
}

function decryptCustomer(customer) {
  if (!customer) return null;

  return {
    ...customer,
    full_name: decryptValue(customer.full_name),
    phone: decryptValue(customer.phone),
  };
}

async function list({ limit = 50, offset = 0, ownerId = null } = {}) {
  const ownerFilter = ownerId === null
    ? ''
    : 'WHERE t.created_by = $3';

  const values = ownerId === null
    ? [limit, offset]
    : [limit, offset, ownerId];

  const result = await pool.query(
    `${SELECT_TICKET}
    ${ownerFilter}
    ORDER BY t.received_at DESC, t.ticket_id DESC
    LIMIT $1 OFFSET $2`,
    values
  );

  return result.rows.map(decryptTicketCustomer);
}

async function findById(id, ownerId = null) {
  const ownerFilter = ownerId === null
    ? ''
    : 'AND t.created_by = $2';

  const values = ownerId === null
    ? [id]
    : [id, ownerId];

  const result = await pool.query(
    `${SELECT_TICKET}
     WHERE t.ticket_id = $1 ${ownerFilter}`,
    values
  );

  return decryptTicketCustomer(result.rows[0] || null);
}

async function findByCode(ticketCode) {
  const result = await pool.query(
    `SELECT ticket_id, ticket_code
     FROM ticket WHERE ticket_code = $1`,
    [ticketCode]
  );
  return result.rows[0] || null;
}

async function findCustomer(id) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone
     FROM customer WHERE customer_id = $1`,
    [id]
  );
  return decryptCustomer(result.rows[0] || null);
}

async function findDevice(id) {
  const result = await pool.query(
    `SELECT device_id, customer_id, serial_no, purchase_date, warranty_months
     FROM device WHERE device_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findDeviceForCustomer(deviceId, customerId) {
  const result = await pool.query(
    `SELECT device_id, customer_id, serial_no, purchase_date, warranty_months
     FROM device
     WHERE device_id = $1 AND customer_id = $2`,
    [deviceId, customerId]
  );
  return result.rows[0] || null;
}

async function findCategory(id) {
  const result = await pool.query(
    `SELECT category_id, category_code, category_name, is_active
     FROM issue_category WHERE category_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findServiceCenter(id) {
  const result = await pool.query(
    `SELECT center_id, center_name, is_active
     FROM service_center WHERE center_id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findOpenByDevice(deviceId) {
  const result = await pool.query(
    `SELECT ticket_id, ticket_code, status
     FROM ticket
     WHERE device_id = $1
       AND status IN ('MOI', 'DANG_XU_LY', 'CHO_LINH_KIEN', 'DA_SUA')
     ORDER BY received_at DESC
     LIMIT 1`,
    [deviceId]
  );
  return result.rows[0] || null;
}

async function create({
  created_by,
  customer_id,
  device_id,
  center_id,
  category_id,
  issue_desc,
  priority,
  received_at,
  due_date,
  accessories,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Serialize ticket creation so code generation and the active-ticket
    // check cannot race with another ticket creation.
    await client.query('LOCK TABLE ticket IN SHARE ROW EXCLUSIVE MODE');

    const active = await client.query(
      `SELECT ticket_id, ticket_code
       FROM ticket
       WHERE device_id = $1
         AND status IN ('MOI', 'DANG_XU_LY', 'CHO_LINH_KIEN', 'DA_SUA')
       LIMIT 1`,
      [device_id]
    );

    if (active.rowCount > 0) {
      const error = new Error('Thiết bị đang có phiếu bảo hành chưa đóng.');
      error.code = 'ACTIVE_TICKET_EXISTS';
      throw error;
    }

    const yearResult = await client.query(
      `SELECT EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::INTEGER AS year`
    );
    const year = yearResult.rows[0].year;
    const pattern = `^BH-([0-9]{6})/${year}$`;

    const numberResult = await client.query(
      `SELECT
         COALESCE(
           MAX((regexp_match(ticket_code, $1))[1]::INTEGER),
           0
         ) + 1 AS next_number
       FROM ticket
       WHERE ticket_code ~ $1`,
      [pattern]
    );

    const nextNumber = Number(numberResult.rows[0].next_number);
    const ticketCode = `BH-${String(nextNumber).padStart(6, '0')}/${year}`;
    const accessoriesJson =
      accessories == null ? null : JSON.stringify(accessories);

    const inserted = await client.query(
      `INSERT INTO ticket (
          ticket_code, created_by, customer_id, device_id,
          center_id, category_id, issue_desc, priority,
          status, received_at, due_date, accessories
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'MOI',
          $9, $10, $11::JSONB
        )
       RETURNING ticket_id`,
      [
        ticketCode,
        created_by,
        customer_id,
        device_id,
        center_id,
        category_id,
        issue_desc,
        priority,
        received_at,
        due_date,
        accessoriesJson,
      ]
    );

    const ticketId = inserted.rows[0].ticket_id;

    await client.query(
      `INSERT INTO ticket_status_log
         (ticket_id, old_status, new_status, reason)
       VALUES ($1, NULL, 'MOI', 'Tiếp nhận phiếu bảo hành')`,
      [ticketId]
    );

    const created = await client.query(
      `${SELECT_TICKET} WHERE t.ticket_id = $1`,
      [ticketId]
    );

    await client.query('COMMIT');
    return decryptTicketCustomer(created.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function update(id, {
  center_id,
  category_id,
  issue_desc,
  priority,
  due_date,
  accessories,
}, ownerId = null) {
  const accessoriesJson =
    accessories == null ? null : JSON.stringify(accessories);

  const ownerFilter = ownerId === null
    ? ''
    : 'AND created_by = $8';

  const values = [
    center_id,
    category_id,
    issue_desc,
    priority,
    due_date,
    accessoriesJson,
    id,
  ];

  if (ownerId !== null) {
    values.push(ownerId);
  }

  const result = await pool.query(
    `UPDATE ticket
     SET center_id = $1,
         category_id = $2,
         issue_desc = $3,
         priority = $4,
         due_date = $5,
         accessories = $6::JSONB
     WHERE ticket_id = $7
       AND status <> 'HUY'
       ${ownerFilter}
     RETURNING ticket_id`,
    values
  );

  if (result.rowCount === 0) return null;

  return findById(result.rows[0].ticket_id, ownerId);
}

async function cancel(id, ownerId = null) {
  const client = await pool.connect();

  const ownerFilter = ownerId === null
    ? ''
    : 'AND created_by = $2';

  const values = ownerId === null
    ? [id]
    : [id, ownerId];

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE ticket
       SET status = 'HUY'
       WHERE ticket_id = $1
         AND status = 'MOI'
         ${ownerFilter}
       RETURNING ticket_id`,
      values
    );

    if (result.rowCount === 0) {
      await client.query('COMMIT');
      return null;
    }

    const ticketId = result.rows[0].ticket_id;

    await client.query(
      `INSERT INTO ticket_status_log
         (ticket_id, old_status, new_status, reason)
       VALUES ($1, 'MOI', 'HUY', 'Hủy phiếu bảo hành')`,
      [ticketId]
    );

    const cancelled = await client.query(
      `${SELECT_TICKET}
       WHERE t.ticket_id = $1
       ${ownerId === null ? '' : 'AND t.created_by = $2'}`,
      values
    );

    await client.query('COMMIT');
    return decryptTicketCustomer(cancelled.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  list,
  findById,
  findByCode,
  findCustomer,
  findDevice,
  findDeviceForCustomer,
  findCategory,
  findServiceCenter,
  findOpenByDevice,
  create,
  update,
  cancel,
};
