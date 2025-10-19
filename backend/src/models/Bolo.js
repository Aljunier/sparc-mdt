import { dbPool as db } from "../config/database.js";

// Get all uncancelled bolos with limited details
export async function getBoloList() {
  const [rows] = await db.query(
    "SELECT id, type, title, status, expires_at, created_at FROM bolos WHERE NOT status = 'cancelled'"
  );
  return rows;
}

// Get all bolos
export async function getAllBolos() {
  const [rows] = await db.query("SELECT * FROM bolos");
  return rows;
}

// Get all details from a specfic bolo from its id
export async function getBolo(id) {
  const [rows] = await db.execute("SELECT * FROM bolos WHERE id = ?", [id]);
  return rows;
}

// Create new bolo
export async function createBolo(fields) {
  const [result] = await db.execute(
    `
    INSERT INTO bolos (
      issued_by,
      report_id,
      type,
      title,
      description,
      status,
      priority,
      expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      fields.issued_by,
      fields.report_id,
      fields.type,
      fields.title,
      fields.description,
      fields.status,
      fields.priority,
      fields.expires_at,
    ]
  );
  return getBolo(result.insertId);
}

// Update bolo
export async function updateBolo(id, fields) {
  const [result] = await db.execute(
    `
    UPDATE bolos
    SET
      issued_by = ?,
      report_id = ?,
      type = ?,
      title = ?,
      description = ?,
      status = ?,
      priority = ?,
      expires_at = ?
    WHERE id = ?
    `,
    [
      fields.issued_by,
      fields.report_id,
      fields.type,
      fields.title,
      fields.description,
      fields.status,
      fields.priority,
      fields.expires_at,
      id,
    ]
  );

  if (!result.affectedRows) {
    return false;
  } else {
    return getBolo(id);
  }
}

// Delete bolo
export async function deleteBolo(id) {
  const [result] = await db.execute(`DELETE FROM bolos WHERE id = ?`, [id]);
  return result.affectedRows;
}
