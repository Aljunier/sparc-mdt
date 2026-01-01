import { dbPool as db } from "#config/database";
import {
  buildInsertQuery,
  buildUpdateQuery,
  recordExists,
} from "#utils/sqlHelpers";

// Roles //

// Get All Roles
export async function getAllRoles() {
  const [rows] = await db.query(
    `SELECT id, category_id AS categoryId, name, is_active FROM roles ORDER BY name ASC`
  );
  return rows;
}

// Get Role by ID
// Private helper function
export async function getRole(id) {
  const roleExists = await recordExists(db, "roles", "id", id);
  if (!roleExists) return null;
  const [rows] = await db.execute(
    `SELECT id, category_id AS categoryId, name, is_active FROM roles WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Create Role
// Expected fields: { category_id, name, is_active (optional) }
export async function createRole(fields) {
  const { query, values } = buildInsertQuery("roles", fields);
  const [result] = await db.execute(query, values);
  return getRole(result.insertId);
}

// Update Role
// Expected fields: { category_id, name, is_active (optional) }
export async function updateRole(id, fields) {
  const allowedNulls = ["is_active"];
  const { query, values } = buildUpdateQuery(
    "roles",
    fields,
    allowedNulls,
    "id"
  );
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0 ? getRole(id) : false;
}

// Toggle Role Active Status
export async function toggleRoleActiveStatus(id) {
  const [result] = await db.execute(
    `UPDATE roles SET is_active = NOT is_active WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0 ? getRole(id) : false;
}

// Delete Role
export async function deleteRole(id) {
  const [result] = await db.execute(`DELETE FROM roles WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

// Role Categories //

// Get All Role Categories
export async function getAllRoleCategories() {
  const [rows] = await db.query(
    `SELECT id, name, is_active FROM role_categories ORDER BY name ASC`
  );
  return rows;
}

// Get Role Category by ID
// Private helper function
export async function getRoleCategory(id) {
  const [rows] = await db.execute(
    `SELECT id, name, is_active FROM role_categories WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Expected fields: { name, is_active (optional) }
export async function createRoleCategory(fields) {
  const { query, values } = buildInsertQuery("role_categories", fields);
  const [result] = await db.execute(query, values);
  return getRoleCategory(result.insertId);
}

// Update Role Category
// Expected fields: { name, is_active (optional) }
export async function updateRoleCategory(id, fields) {
  const { query, values } = buildUpdateQuery(
    "role_categories",
    fields,
    [],
    "id"
  );
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0 ? getRoleCategory(id) : false;
}

// Toggle Role Category Active Status
export async function toggleRoleCategoryActiveStatus(id) {
  const [result] = await db.execute(
    `UPDATE role_categories SET is_active = NOT is_active WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0 ? getRoleCategory(id) : false;
}

// Delete Role Category
export async function deleteRoleCategory(id) {
  const [result] = await db.execute(
    `DELETE FROM role_categories WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}
