import { dbPool as db } from "../config/database.js";
import { buildInsertQuery, buildUpdateQuery } from "../utils/sqlHelpers.js";
import { paginate } from "../utils/pagination.js";

// Get all uncancelled bolos with limited details
export async function getBoloSummary(page = 1, pageSize = 10) {
  const query = `
    SELECT
      b.id,
      b.type,
      b.title,
      b.priority,
      b.expires_at,
      b.created_at,
      -- Fetch associated vehicles as a JSON array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', v.id,
            'plate_number', v.plate_number,
            'plate_state', v.plate_state,
            'make', v.make,
            'model', v.model,
            'color', v.color
          )
        )
        FROM bolos_vehicles bv
        JOIN vehicles v ON bv.vehicle_id = v.id
        WHERE bv.bolo_id = b.id
      ) AS vehicles,
      -- Fetch associated persons as a JSON array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'role', bp.role,
            'first_name', p.first_name,
            'middle_name', p.middle_name,
            'last_name', p.last_name,
            'dob', p.dob,
            'license_number', p.license_number,
            'license_state', p.license_state
          )
        )
        FROM bolos_persons bp
        JOIN persons p ON bp.person_id = p.id
        WHERE bp.bolo_id = b.id
      ) AS persons
    FROM bolos b
    WHERE b.status = 'active'
    ORDER BY b.priority DESC, b.created_at DESC
  `;
  const countQuery = `SELECT COUNT(*) as total FROM bolos WHERE status = 'active'`;
  return paginate(query, page, pageSize, [], countQuery);
}

// Get all details from a specfic bolo from its id
export async function getBolo(id) {
  // Query to get bolo details including associated vehicles and persons
  const [rows] = await db.execute(
    `SELECT 
      b.*,
      -- Fetch associated vehicles as a JSON array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', v.id,
            'plate_number', v.plate_number,
            'plate_state', v.plate_state,
            'make', v.make,
            'model', v.model,
            'color', v.color
          )
        )
        FROM bolos_vehicles bv
        JOIN vehicles v ON bv.vehicle_id = v.id
        WHERE bv.bolo_id = b.id
      ) AS vehicles,
      -- Fetch associated persons as a JSON array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'role', bp.role,
            'first_name', p.first_name,
            'middle_name', p.middle_name,
            'last_name', p.last_name,
            'dob', p.dob,
            'license_number', p.license_number,
            'license_state', p.license_state
          )
        )
        FROM bolos_persons bp
        JOIN persons p ON bp.person_id = p.id
        WHERE bp.bolo_id = b.id
      ) AS persons
    FROM bolos b
    WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Create new bolo
export async function createBolo(fields) {
  const allowedNulls = ["report_id"];
  const { query, values } = buildInsertQuery("bolos", fields, allowedNulls);
  const [result] = await db.execute(query, values);
  return getBolo(result.insertId);
}

// Update bolo
export async function updateBolo(id, fields) {
  const { query, values } = buildUpdateQuery(
    "bolos",
    fields,
    ["report_id"],
    "id"
  );
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows ? getBolo(id) : false;
}

// Delete bolo
export async function deleteBolo(id) {
  const [result] = await db.execute(`DELETE FROM bolos WHERE id = ?`, [id]);
  return result.affectedRows;
}

// Vehicle Bolos //
export async function createBoloVehicle(bolo_id, vehicle_id) {
  const [result] = await db.execute(
    `INSERT IGNORE INTO bolos_vehicles (bolo_id, vehicle_id) VALUES (?,?)`,
    [bolo_id, vehicle_id]
  );
  return result.affectedRows ? getBolo(bolo_id) : false;
}

export async function deleteBoloVehicle(bolo_id, vehicle_id) {
  const [result] = await db.execute(
    `DELETE FROM bolos_vehicles WHERE bolo_id = ? AND vehicle_id = ?`,
    [bolo_id, vehicle_id]
  );
  return result.affectedRows;
}

// Persons Bolos //
export async function createBoloPerson(bolo_id, fields) {
  const [result] = await db.execute(
    `INSERT IGNORE INTO bolos_persons (bolo_id, person_id, role) VALUES (?,?,?)`,
    [bolo_id, fields.person_id, fields.role]
  );
  return result.affectedRows ? getBolo(bolo_id) : false;
}

export async function updateBoloPerson(bolo_id, fields) {
  const [result] = await db.execute(
    `UPDATE bolos_persons
    SET
      role = ?
    WHERE bolo_id = ? AND person_id = ?`,
    [fields.role, bolo_id, fields.person_id]
  );
  return result.affectedRows ? getBolo(bolo_id) : false;
}

export async function deleteBoloPerson(bolo_id, person_id) {
  const [result] = await db.execute(
    `DELETE FROM bolos_persons WHERE bolo_id = ? AND person_id = ?`,
    [bolo_id, person_id]
  );
  return result.affectedRows;
}
