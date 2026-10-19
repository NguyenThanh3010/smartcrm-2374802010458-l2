const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const client = await pool.connect();
  let sql = '';
  let inTransaction = false;

  try {
    const seedPath = path.join(__dirname, 'seeds', '001_demo_data.sql');
    sql = fs.readFileSync(seedPath, 'utf8').replace(/^\uFEFF/, '');

    await client.query('BEGIN');
    inTransaction = true;

    await client.query(sql);

    await client.query('COMMIT');
    inTransaction = false;
    console.log('Nạp dữ liệu mẫu thành công.');
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK');
    }

    if (error.position && sql) {
      const pos = Number(error.position) - 1;
      console.error('Vị trí lỗi trong SQL:', error.position);
      console.error(
        'Đoạn SQL quanh lỗi:',
        sql.slice(Math.max(0, pos - 100), Math.min(sql.length, pos + 120))
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch(error => {
    console.error('Nạp dữ liệu mẫu thất bại:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
