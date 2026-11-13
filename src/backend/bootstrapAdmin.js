
const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const username = process.env.AUTH_USERNAME?.trim();
  const password = process.env.AUTH_PASSWORD;

  if (!username || !password) {
    throw new Error('BOOTSTRAP_CONFIG_MISSING');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO app_user (
         username, password_hash, role, is_active
       )
       VALUES ($1, $2, 'ADMIN', TRUE)
       ON CONFLICT (username)
       DO UPDATE SET role = 'ADMIN', is_active = TRUE
       RETURNING user_id`,
      [username, passwordHash],
    );

    const adminId = result.rows[0].user_id;

    const assigned = await client.query(
      `UPDATE ticket
       SET created_by = $1
       WHERE created_by IS NULL`,
      [adminId],
    );

    await client.query(
      `ALTER TABLE ticket
       ALTER COLUMN created_by SET NOT NULL`,
    );

    await client.query('COMMIT');

    console.log('[BOOTSTRAP] Admin account ready.');
    console.log(
      `[BOOTSTRAP] Assigned ${assigned.rowCount} existing tickets.`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch(error => {
    console.error('[BOOTSTRAP ERROR]', {
      code: error.code || 'UNKNOWN',
    });
    process.exitCode = 1;
  })
  .finally(() => pool.end());