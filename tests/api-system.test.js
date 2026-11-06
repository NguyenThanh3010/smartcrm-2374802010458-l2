
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// db.js tự nạp cấu hình .env
const { pool } = require('../src/backend/src/db');

// Chỉ cho phép chạy trên database kiểm thử.
if (process.env.DB_NAME !== 'smartcrm_test') {
  throw new Error(
    'API Test chỉ được chạy với database smartcrm_test'
  );
}

const app = require('../src/backend/src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  await pool.end();
});

async function getToken() {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: process.env.AUTH_USERNAME,
      password: process.env.AUTH_PASSWORD,
    }),
  });

  assert.equal(response.status, 200);

  const body = await response.json();
  assert.ok(body.data.token);

  return body.data.token;
}

// API-01: Tạo phiếu bảo hành thành công.
test('API-01: API tạo phiếu hợp lệ trả về HTTP 201', async () => {
  let deviceId;
  let ticketId;

  try {
    const token = await getToken();

    const lookup = await pool.query(`
      SELECT
        c.customer_id,
        d.device_id,
        (
          SELECT center_id FROM service_center
          WHERE center_name = 'Trung tâm Mekong - Quận 1'
          LIMIT 1
        ) AS center_id,
        (
          SELECT category_id FROM issue_category
          WHERE category_code = 'MAN_HINH'
          LIMIT 1
        ) AS category_id
      FROM customer c
      JOIN device d ON d.customer_id = c.customer_id
      WHERE c.phone = '0901234567'
        AND d.serial_no = 'SM-MEK-0004'
    `);

    assert.equal(lookup.rowCount, 1);

    const data = lookup.rows[0];
    deviceId = data.device_id;

    const response = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer_id: data.customer_id,
        device_id: data.device_id,
        center_id: data.center_id,
        category_id: data.category_id,
        issue_desc: 'API test tạo phiếu bảo hành hợp lệ',
        priority: 'TRUNG_BINH',
        accessories: ['SAC'],
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.ok(body.ticket_id);
    assert.ok(body.ticket_code);
    assert.equal(body.status, 'MOI');

    ticketId = body.ticket_id;

    const saved = await pool.query(
      `SELECT ticket_id, status
       FROM ticket WHERE ticket_id = $1`,
      [ticketId]
    );

    assert.equal(saved.rowCount, 1);
    assert.equal(saved.rows[0].status, 'MOI');

    const history = await pool.query(
      `SELECT new_status
       FROM ticket_status_log
       WHERE ticket_id = $1`,
      [ticketId]
    );

    assert.equal(history.rowCount, 1);
    assert.equal(history.rows[0].new_status, 'MOI');
  } finally {
    // Xóa dữ liệu thử nghiệm sau khi kiểm tra.
    if (ticketId) {
      await pool.query(
        'DELETE FROM ticket_status_log WHERE ticket_id = $1',
        [ticketId]
      );

      await pool.query(
        'DELETE FROM ticket WHERE ticket_id = $1',
        [ticketId]
      );
    }
  }
});

// API-02: Từ chối dữ liệu không hợp lệ.
test('API-02: API từ chối mô tả lỗi ngắn hơn 10 ký tự', async () => {
  const token = await getToken();

  const response = await fetch(`${baseUrl}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer_id: 1,
      device_id: 1,
      center_id: 1,
      category_id: 1,
      issue_desc: 'Lỗi',
      priority: 'CAO',
      accessories: [],
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'VALIDATION_FAILED');
  assert.ok(body.error.fields.issue_desc);
});

// API-03: API từ chối truy cập khi chưa đăng nhập.
test('API-03: API yêu cầu Bearer token hợp lệ', async () => {
  const response = await fetch(`${baseUrl}/api/tickets`);

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'AUTH_REQUIRED');
});
