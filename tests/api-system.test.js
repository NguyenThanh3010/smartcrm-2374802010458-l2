
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// db.js tự nạp cấu hình .env
const { pool } = require('../src/backend/src/db');
const {
  phoneLookupHash,
} = require('../src/backend/src/security/customerCrypto');

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
     WHERE c.phone_lookup_hash = $1
        AND d.serial_no = 'SM-MEK-0004'
      `, [phoneLookupHash('0901234567')]);

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

// API-04: ADMIN tạo tài khoản nhân viên với mật khẩu đã băm.
test('API-04: ADMIN tạo tài khoản STAFF thành công', async () => {
  const token = await getToken();

  const username = `staff_test_${Date.now()}`;
  const password = 'StaffTest@2026';

  let staffId;

  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.username, username);
    assert.equal(body.data.role, 'STAFF');

    staffId = body.data.user_id;

    const saved = await pool.query(
      `SELECT user_id, username, password_hash, role
       FROM app_user
       WHERE user_id = $1`,
      [staffId]
    );

    assert.equal(saved.rowCount, 1);
    assert.equal(saved.rows[0].username, username);
    assert.equal(saved.rows[0].role, 'STAFF');
    assert.notEqual(saved.rows[0].password_hash, password);
    assert.match(saved.rows[0].password_hash, /^\$2[aby]\$/);

    // Kiểm tra nhân viên có thể đăng nhập bằng mật khẩu ban đầu.
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const loginBody = await login.json();

    assert.equal(login.status, 200);
    assert.ok(loginBody.data.token);
    assert.equal(loginBody.data.user.role, 'STAFF');
  } finally {
    if (staffId) {
      await pool.query(
        'DELETE FROM app_user WHERE user_id = $1',
        [staffId]
      );
    }
  }
});


// API-05: Kiểm tra quyền sở hữu phiếu giữa hai nhân viên.
test('API-05: Nhân viên chỉ được truy cập phiếu của mình', async () => {
  const adminToken = await getToken();

  const suffix = Date.now();
  const password = 'StaffTest@2026';

  let staffA;
  let staffB;
  let ticketId;

  async function createStaff(username) {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ username, password }),
    });

    assert.equal(response.status, 201);

    const body = await response.json();
    return body.data;
  }

  async function login(username) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    assert.equal(response.status, 200);

    const body = await response.json();
    return body.data.token;
  }

  try {
    // Tạo hai tài khoản nhân viên.
    staffA = await createStaff(`staff_a_${suffix}`);
    staffB = await createStaff(`staff_b_${suffix}`);

    const tokenA = await login(staffA.username);
    const tokenB = await login(staffB.username);

    // Tìm thiết bị dành riêng cho kiểm thử.
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
    WHERE c.phone_lookup_hash = $1
      AND d.serial_no = 'SM-MEK-0004'
    `, [phoneLookupHash('0901234567')]);

    assert.equal(lookup.rowCount, 1);

    const data = lookup.rows[0];

    // Nhân viên A tạo phiếu.
    const createResponse = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        customer_id: data.customer_id,
        device_id: data.device_id,
        center_id: data.center_id,
        category_id: data.category_id,
        issue_desc: 'Kiểm thử quyền sở hữu phiếu của nhân viên A',
        priority: 'TRUNG_BINH',
        accessories: ['SAC'],
      }),
    });

    const created = await createResponse.json();

    assert.equal(createResponse.status, 201);
    ticketId = created.ticket_id;

    // Xác nhận database lưu đúng người tạo.
    const saved = await pool.query(
      'SELECT created_by FROM ticket WHERE ticket_id = $1',
      [ticketId],
    );

    assert.equal(String(saved.rows[0].created_by), String(staffA.user_id));

    // A xem phiếu của A: được phép.
    const aDetail = await fetch(
      `${baseUrl}/api/tickets/${ticketId}`,
      { headers: { Authorization: `Bearer ${tokenA}` } },
    );

    assert.equal(aDetail.status, 200);

    // B xem phiếu của A: không được phép.
    const bDetail = await fetch(
      `${baseUrl}/api/tickets/${ticketId}`,
      { headers: { Authorization: `Bearer ${tokenB}` } },
    );

    assert.equal(bDetail.status, 404);

    const bDetailBody = await bDetail.json();
    assert.equal(bDetailBody.error.code, 'TICKET_NOT_FOUND');

    // B cập nhật phiếu của A: không được phép.
    const bUpdate = await fetch(
      `${baseUrl}/api/tickets/${ticketId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({}),
      },
    );

    assert.equal(bUpdate.status, 404);

    // B hủy phiếu của A: không được phép.
    const bCancel = await fetch(
      `${baseUrl}/api/tickets/${ticketId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenB}` },
      },
    );

    assert.equal(bCancel.status, 404);

    // Phiếu của A không xuất hiện trong danh sách của B.
    const bList = await fetch(
      `${baseUrl}/api/tickets`,
      { headers: { Authorization: `Bearer ${tokenB}` } },
    );

    assert.equal(bList.status, 200);
    const bListBody = await bList.json();

    assert.equal(
      bListBody.data.some(ticket => String(ticket.ticket_id) === String(ticketId)),
      false,
    );

    // ADMIN vẫn xem được phiếu của A.
    const adminDetail = await fetch(
      `${baseUrl}/api/tickets/${ticketId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    assert.equal(adminDetail.status, 200);

    // STAFF không được tạo tài khoản nhân viên khác.
    const bCreateUser = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        username: `unauthorized_${suffix}`,
        password,
      }),
    });

    assert.equal(bCreateUser.status, 403);
  } finally {
    // Dọn dữ liệu thử nghiệm sau khi kiểm tra.
    if (ticketId) {
      await pool.query(
        'DELETE FROM ticket_status_log WHERE ticket_id = $1',
        [ticketId],
      );

      await pool.query(
        'DELETE FROM ticket WHERE ticket_id = $1',
        [ticketId],
      );
    }

    if (staffA?.user_id) {
      await pool.query(
        'DELETE FROM app_user WHERE user_id = $1',
        [staffA.user_id],
      );
    }

    if (staffB?.user_id) {
      await pool.query(
        'DELETE FROM app_user WHERE user_id = $1',
        [staffB.user_id],
      );
    }
  }
});
