const { pool } = require('../db');

const {
  encryptValue,
  decryptValue,
  phoneLookupHash,
} = require('../security/customerCrypto');

function decryptCustomer(customer) {
  if (!customer) return null;

  return {
    ...customer,
    full_name: decryptValue(customer.full_name),
    phone: decryptValue(customer.phone),
    address: decryptValue(customer.address),
  };
}

async function list({ limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     ORDER BY customer_id
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows.map(decryptCustomer);
}

async function findById(id) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     WHERE customer_id = $1`,
    [id]
  );

  return decryptCustomer(result.rows[0] || null);
}

async function findByPhone(phone) {
  const result = await pool.query(
    `SELECT customer_id, full_name, phone, address
     FROM customer
     WHERE phone_lookup_hash = $1`,
    [phoneLookupHash(phone)]
  );

  return decryptCustomer(result.rows[0] || null);
}

async function create({ full_name, phone, address }) {
  const result = await pool.query(
    `INSERT INTO customer
       (full_name, phone, address, phone_lookup_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING customer_id, full_name, phone, address`,
    [
      encryptValue(full_name),
      encryptValue(phone),
      encryptValue(address),
      phoneLookupHash(phone),
    ]
  );

  return decryptCustomer(result.rows[0]);
}

async function update(id, { full_name, phone, address }) {
  const result = await pool.query(
    `UPDATE customer
     SET full_name = $1,
         phone = $2,
         address = $3,
         phone_lookup_hash = $4
     WHERE customer_id = $5
     RETURNING customer_id, full_name, phone, address`,
    [
      encryptValue(full_name),
      encryptValue(phone),
      encryptValue(address),
      phoneLookupHash(phone),
      id,
    ]
  );

  return decryptCustomer(result.rows[0] || null);
}

async function remove(id) {
  const result = await pool.query(
    `DELETE FROM customer
     WHERE customer_id = $1
     RETURNING customer_id, full_name, phone, address`,
    [id]
  );

  return decryptCustomer(result.rows[0] || null);
}

module.exports = {
  list,
  findById,
  findByPhone,
  create,
  update,
  remove,
};