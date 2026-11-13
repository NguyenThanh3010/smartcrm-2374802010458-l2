const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
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

const DEMO_CUSTOMERS = [
  {
    full_name: 'Nguyễn Minh Anh',
    phone: '0901234567',
    address: 'Quận 1, TP. Hồ Chí Minh',
  },
  {
    full_name: 'Trần Quốc Bảo',
    phone: '0912345678',
    address: 'TP. Thủ Đức, TP. Hồ Chí Minh',
  },
  {
    full_name: 'Lê Thu Hà',
    phone: '0987654321',
    address: 'Quận 3, TP. Hồ Chí Minh',
  },
];

async function main() {
  const client = await pool.connect();
  let sql = '';
  let inTransaction = false;

  try {
    // Kiểm tra khóa trước khi xử lý dữ liệu.
    encryptValue('CONFIG_CHECK');
    phoneLookupHash('0900000000');

    const seedPath = path.join(__dirname, 'seeds', '001_demo_data.sql');

    sql = fs.readFileSync(seedPath, 'utf8').replace(/^\uFEFF/, '');

    await client.query('BEGIN');
    inTransaction = true;

    // Mã hóa và nạp dữ liệu khách hàng mẫu.
    for (const customer of DEMO_CUSTOMERS) {
      const phoneHash = phoneLookupHash(customer.phone);

      await client.query(
        `INSERT INTO customer
           (full_name, phone, address, phone_lookup_hash)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (phone_lookup_hash) DO NOTHING`,
        [
          encryptValue(customer.full_name),
          encryptValue(customer.phone),
          encryptValue(customer.address),
          phoneHash,
        ]
      );

      // Thay mã giữ chỗ bằng HMAC thực tế.
      sql = sql.replaceAll(
        `{{PHONE_HASH_${customer.phone}}}`,
        phoneHash
      );
    }

    if (sql.includes('{{PHONE_HASH_')) {
      throw new Error('Còn mã giữ chỗ PHONE_HASH chưa được thay thế.');
    }

    await client.query(sql);

    await client.query('COMMIT');
    inTransaction = false;

    console.log('Nạp dữ liệu mẫu thành công.');
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK');
    }

    if (error.position) {
      const position = Number(error.position);

      if (Number.isInteger(position) && position > 0) {
        console.error('[SEED ERROR] Vị trí lỗi trong SQL:', position);
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch(error => {
    console.error('[SEED ERROR] Nạp dữ liệu mẫu thất bại.', {
      code: error.code || 'UNKNOWN',
    });
    process.exitCode = 1;
  })
  .finally(() => pool.end());