import { dbPool as db } from "../config/database.js";
import { buildInsertQuery, buildUpdateQuery } from "../utils/sqlHelpers.js";
import { paginate } from "../utils/pagination.js";

// Get all active warrants with limited details
export async function getWarrantSummary(page = 1, pageSize = 10) {
  const query = `
    SELECT
      w.id,
      w.type,
      w.expires_at,
      w.created_at,
      -- Fetch associated person as a JSON object
      (
        SELECT JSON_OBJECT(
          'id', p.id,
          'first_name', p.first_name,
          'middle_name', p.middle_name,
          'last_name', p.last_name,
          'sex', p.sex,
          'dob', p.dob,
          'license_number', p.license_number,
          'license_state', p.license_state
        )
        FROM persons p
        WHERE w.person_id = p.id
      ) AS person
    FROM warrants w
    WHERE w.status = 'active'
    ORDER BY w.created_at DESC
  `;

  const countQuery = `SELECT COUNT(*) as total FROM warrants WHERE status = 'active'`;
  return paginate(query, page, pageSize, [], countQuery);
}

// Get all details from a specfic warrant from its id
export async function getWarrant(id) {
  // Query to get warrant details including associated person
  const [rows] = await db.execute(
    `SELECT 
      w.*,
      -- Fetch associated person as a JSON object
      (
        SELECT JSON_OBJECT(
          'id', p.id,
          'first_name', p.first_name,
          'middle_name', p.middle_name,
          'last_name', p.last_name,
          'sex', p.sex,
          'dob', p.dob,
          'license_number', p.license_number,
          'license_state', p.license_state
        )
        FROM persons p
        WHERE w.person_id = p.id
      ) AS person
    FROM warrants w
    WHERE w.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Create new warrant
export async function createWarrant(fields) {
  const { query, values } = buildInsertQuery("warrants", fields);
  const [result] = await db.execute(query, values);
  return getWarrant(result.insertId);
}

// Update warrant
export async function updateWarrant(id, fields) {
  const { query, values } = buildUpdateQuery("warrants", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows ? getWarrant(id) : false;
}

// Delete warrant
export async function deleteWarrant(id) {
  const [result] = await db.execute(`DELETE FROM warrants WHERE id = ?`, [id]);
  return result.affectedRows;
}
