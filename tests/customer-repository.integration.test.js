const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
// db.js tự nạp file .env bằng dotenv của Backend.
const { pool } = require('../src/backend/src/db');

// Chỉ cho phép chạy trên database kiểm thử.
if (process.env.DB_NAME !== 'smartcrm_test') {
  throw new Error(
    'Integration Test chỉ được chạy với database smartcrm_test'
  );
}

const customerRepository = require('../src/backend/src/repositories/customerRepository');

after(async () => {
  await pool.end();
});

async function createTestPhone() {
  for (let i = 0; i < 5; i++) {
    const phone = `0${crypto.randomInt(100000000, 1000000000)}`;
    const existing = await customerRepository.findByPhone(phone);

    if (!existing) return phone;
  }

  throw new Error('Không tạo được số điện thoại thử nghiệm duy nhất');
}

// IT-01: Kiểm tra lưu và truy vấn dữ liệu PostgreSQL.
test('IT-01: PostgreSQL lưu và truy vấn lại khách hàng', async () => {
  let customer;

  try {
    const phone = await createTestPhone();

    customer = await customerRepository.create({
      full_name: 'Integration Test Customer',
      phone,
      address: 'Dia chi kiem thu',
    });

    const found = await customerRepository.findByPhone(phone);

    assert.ok(found);
    assert.equal(
      String(found.customer_id),
      String(customer.customer_id)
    );
    assert.equal(found.full_name, 'Integration Test Customer');
    assert.equal(found.phone, phone);
  } finally {
    if (customer) {
      await customerRepository.remove(customer.customer_id);
    }
  }
});

// IT-02: Kiểm tra ràng buộc số điện thoại duy nhất.
test('IT-02: PostgreSQL từ chối số điện thoại bị trùng', async () => {
  let customer;

  try {
    const phone = await createTestPhone();

    customer = await customerRepository.create({
      full_name: 'Integration Test Customer 1',
      phone,
      address: 'Dia chi kiem thu',
    });

    await assert.rejects(
      customerRepository.create({
        full_name: 'Integration Test Customer 2',
        phone,
        address: 'Dia chi kiem thu',
      }),
      (error) => error.code === '23505'
    );
  } finally {
    if (customer) {
      await customerRepository.remove(customer.customer_id);
    }
  }
});