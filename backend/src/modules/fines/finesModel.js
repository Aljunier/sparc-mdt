import { dbPool as db } from "#config/database";
import { buildInsertQuery, buildUpdateQuery } from "#utils/sqlHelpers";

// Get fine by id (Private helper function)
async function getFineById(id) {
  const [rows] = await db.execute("SELECT * FROM fines WHERE id = ?", [id]);
  return rows[0] || null;
}

// Create fine record
// Expected fields: { person_id, issued_by, type, description, amount, status, due_by }
export async function createFine(fields) {
  const { query, values } = buildInsertQuery("fines", fields);
  const [result] = await db.execute(query, values);
  return getFineById(result.insertId);
}

// Update fine record
// Expected fields: { person_id, issued_by, type, description, amount, status, due_by, paid_at }
export async function updateFine(id, fields) {
  const { query, values } = buildUpdateQuery("fines", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0;
}

// Update fine status
export async function updateFineStatus(id, fields) {
  const { query, values } = buildUpdateQuery("fines", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0;
}

// Delete fine record
export async function deleteFine(id) {
  const [result] = await db.execute(`DELETE FROM fines WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}
