import { dbPool as db } from "#config/database";
import { paginate } from "#utils/pagination";
import {
  buildInsertQuery,
  buildUpdateQuery,
  selectWithFilters,
} from "#utils/sqlHelpers";

// Get vehicle by ID
export async function getVehicleById(id) {
  const [results] = await db.execute(
    `SELECT *
     FROM vehicles WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Vehicle search with pagination
export async function searchVehicles(
  { plateNum, plateState, vin, make, model, year, color, type },
  page = 1,
  pageSize = 10
) {
  const filters = {
    plate_num: { value: plateNum, operator: "LIKE" },
    plate_state: { value: plateState, operator: "=" },
    vin: { value: vin, operator: "LIKE" },
    make: { value: make, operator: "LIKE" },
    model: { value: model, operator: "LIKE" },
    year: { value: year, operator: "=" },
    color: { value: color, operator: "LIKE" },
    type: { value: type, operator: "=" },
  };

  const { query, values, countQuery } = await selectWithFilters({
    table: "vehicles",
    filters,
    orderBy: "created_at DESC",
  });

  return paginate(query, page, pageSize, values, countQuery);
}

// Create new vehicle record
// Expected fields: { plate_number, plate_state, vin, make, model, year, color, type, registered_to }
export async function createVehicle(fields) {
  const { query, values } = buildInsertQuery("vehicles", fields);
  const [result] = await db.execute(query, values);
  return getVehicleById(result.insertId);
}

// Update existing vehicle record
// Expected fields: { plate_number, plate_state, vin, make, model, year, color, type, registered_to }
export async function updateVehicle(id, fields) {
  const { query, values } = buildUpdateQuery("vehicles", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0;
}

// Delete vehicle record
export async function deleteVehicle(id) {
  const [result] = await db.execute("DELETE FROM vehicles WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
