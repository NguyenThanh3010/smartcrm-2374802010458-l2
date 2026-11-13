const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const { Pool } = require('pg');

const {
  encryptValue,
  phoneLookupHash,
} = require('./src/security/customerCrypto');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const client = await pool.connect();
  let inTransaction = false;

  try {
    // Kiểm tra hai khóa trước khi xử lý dữ liệu.
    encryptValue('CONFIG_CHECK');
    phoneLookupHash('0900000000');

    await client.query('BEGIN');
    inTransaction = true;

    // Bỏ ràng buộc cũ vì số điện thoại sẽ chuyển thành ciphertext.
    await client.query(`
      ALTER TABLE customer
        DROP CONSTRAINT IF EXISTS ck_customer_phone;

      ALTER TABLE customer
        DROP CONSTRAINT IF EXISTS customer_phone_key;
    `);

    // Lấy những khách hàng chưa được mã hóa.
    const result = await client.query(`
      SELECT customer_id, full_name, phone, address
      FROM customer
      WHERE phone_lookup_hash IS NULL
      ORDER BY customer_id
      FOR UPDATE
    `);

    for (const customer of result.rows) {
      const encryptedName = encryptValue(customer.full_name);
      const encryptedPhone = encryptValue(customer.phone);
      const encryptedAddress = encryptValue(customer.address);
      const phoneHash = phoneLookupHash(customer.phone);

      await client.query(
        `UPDATE customer
         SET full_name = $1,
             phone = $2,
             address = $3,
             phone_lookup_hash = $4
         WHERE customer_id = $5`,
        [
          encryptedName,
          encryptedPhone,
          encryptedAddress,
          phoneHash,
          customer.customer_id,
        ]
      );
    }

    // Đảm bảo mọi khách hàng đều có mã tra cứu.
    await client.query(`
      ALTER TABLE customer
        ALTER COLUMN phone_lookup_hash SET NOT NULL;
    `);

    // Đảm bảo không có hai khách hàng dùng cùng số điện thoại.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
        uq_customer_phone_lookup_hash
      ON customer(phone_lookup_hash);
    `);

    await client.query('COMMIT');
    inTransaction = false;

    console.log(
      `[ENCRYPT] Đã mã hóa ${result.rowCount} khách hàng.`
    );
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK');
    }

    console.error('[ENCRYPT ERROR]', {
      code: error.code || 'UNKNOWN',
    });

    process.exitCode = 1;
  } finally {
    client.release();
  }
}

main().finally(() => pool.end());