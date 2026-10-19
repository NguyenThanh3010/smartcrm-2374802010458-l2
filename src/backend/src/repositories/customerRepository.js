const { pool } = require('../db');

async function list({ limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     ORDER BY customer_id
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     WHERE customer_id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function findByPhone(phone) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     WHERE phone = $1`,
    [phone]
  );

  return result.rows[0] || null;
}

async function create({ full_name, phone, address }) {
  const result = await pool.query(
    `INSERT INTO customer (full_name, phone, address)
     VALUES ($1, $2, $3)
     RETURNING customer_id, full_name, phone, address`,
    [full_name, phone, address ?? null]
  );

  return result.rows[0];
}

async function update(id, { full_name, phone, address }) {
  const result = await pool.query(
    `UPDATE customer
     SET full_name = $1, phone = $2, address = $3
     WHERE customer_id = $4
     RETURNING customer_id, full_name, phone, address`,
    [full_name, phone, address ?? null, id]
  );

  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    `DELETE FROM customer
     WHERE customer_id = $1
     RETURNING customer_id, full_name, phone, address`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
  findByPhone,
  create,
  update,
  remove,
};
