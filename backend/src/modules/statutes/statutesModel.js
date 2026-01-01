import { dbPool as db } from "#config/database";
import {
  buildInsertQuery,
  buildUpdateQuery,
  selectWithFilters,
} from "#utils/sqlHelpers";
import { paginate } from "#utils/pagination";

// Get statute by ID
export async function getStatuteById(id) {
  const [results] = await db.execute(
    `SELECT *
     FROM statutes WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Statute search with pagination (Including inactive statutes)
export async function searchStatutes(
  { code, title, severity },
  page = 1,
  pageSize = 10
) {
  const filters = {
    code: { value: code, operator: "LIKE" },
    title: { value: title, operator: "LIKE" },
    severity: { value: severity, operator: "=" },
  };

  const { query, values, countQuery } = await selectWithFilters({
    table: "statutes",
    filters,
    orderBy: "code DESC",
  });

  return paginate(query, page, pageSize, values, countQuery);
}

// Create new statute record
// Expected fields: { code, title, description, severity, fine }
export async function createStatute(fields) {
  const { query, values } = buildInsertQuery("statutes", fields);
  const [result] = await db.execute(query, values);
  return result.insertId;
}

// Update existing statute record
// Expected fields: { code, title, description, severity, fine }
export async function updateStatute(id, fields) {
  const { query, values } = buildUpdateQuery("statutes", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0;
}

// Toggle statute active status
export async function toggleStatuteStatus(id) {
  const [result] = await db.execute(
    `UPDATE statutes SET is_active = NOT is_active WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0 ? getStatuteById(id) : false;
}

// Delete statute record
export async function deleteStatute(id) {
  const [result] = await db.execute(`DELETE FROM statutes WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}