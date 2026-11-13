const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

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

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await client.query(
      'SELECT filename FROM schema_migrations'
    );
    const applied = new Set(result.rows.map(row => row.filename));

    const migrationDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Đã áp dụng, bỏ qua: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(
        path.join(migrationDir, file),
        'utf8'
      );

      console.log(`Đang chạy migration: ${file}`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`Thành công: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');

        const migrationError = new Error(`Migration thất bại: ${file}`);
        migrationError.code = error.code || 'UNKNOWN';
        migrationError.migration = file;

        throw migrationError;
      }
    }

    console.log('Hoàn tất migration.');
  } finally {
    client.release();
  }
}

main()
  .catch(error => {
    console.error('[MIGRATION ERROR]', {
      migration: error.migration || 'UNKNOWN',
      code: error.code || 'UNKNOWN',
    });
    process.exitCode = 1;
  })
  .finally(() => pool.end());