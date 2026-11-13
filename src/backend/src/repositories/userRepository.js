
const { pool } = require('../db');

async function findByUsername(username) {
  const result = await pool.query(
    `SELECT
       user_id,
       username,
       password_hash,
       role,
       is_active
     FROM app_user
     WHERE username = $1`,
    [username],
  );

  return result.rows[0] || null;
}

async function findActiveById(userId) {
  const result = await pool.query(
    `SELECT
       user_id,
       username,
       role,
       is_active
     FROM app_user
     WHERE user_id = $1
       AND is_active = TRUE`,
    [userId],
  );

  return result.rows[0] || null;
}

async function create({ username, passwordHash, role = 'STAFF' }) {
  const result = await pool.query(
    `INSERT INTO app_user (
       username,
       password_hash,
       role
     )
     VALUES ($1, $2, $3)
     RETURNING user_id, username, role, is_active, created_at`,
    [username, passwordHash, role],
  );

  return result.rows[0];
}

module.exports = {
  findByUsername,
  findActiveById,
  create,
};