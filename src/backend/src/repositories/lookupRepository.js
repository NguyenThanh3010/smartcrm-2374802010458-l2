const { pool } = require('../db');

async function listActiveIssueCategories() {
  const result = await pool.query(
    `SELECT category_id, category_code, category_name
     FROM issue_category
     WHERE is_active = TRUE
     ORDER BY category_id ASC`
  );

  return result.rows;
}

async function listActiveServiceCenters() {
  const result = await pool.query(
    `SELECT center_id, center_name
     FROM service_center
     WHERE is_active = TRUE
     ORDER BY center_id ASC`
  );

  return result.rows;
}

module.exports = {
  listActiveIssueCategories,
  listActiveServiceCenters,
};
