import { dbPool as db } from "#config/database";
import { paginate } from "#utils/pagination";
import {
  buildInsertQuery,
  buildUpdateQuery,
  recordExists,
} from "#utils/sqlHelpers";

/// Users ///

// Get User by ID
export async function getUserById(id) {
  const [results] = await db.execute(
    `SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.call_sign,
      u.created_at,
      u.updated_at,
      -- Fetch roles as a JSON array
      (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', r.id,
          'name', r.name,
          'category_id', rc.id,
          'category_name', rc.name
        ))
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        JOIN role_categories rc ON r.category_id = rc.id
        WHERE ur.user_id = u.id
      ) AS roles
    FROM users u WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Create User
// Expected fields: { username, password_hash, first_name, last_name, call_sign }
export async function createUser(fields) {
  // Users table insert
  const { query, values } = buildInsertQuery("users", fields);
  const [result] = await db.execute(query, values);
  const response = await getUserById(result.insertId);

  // Settings table insert with default settings
  if (response)
    await db.execute("INSERT INTO user_settings (user_id) VALUES (?)", [
      result.insertId,
    ]);
  return response;
}

// Update User
// Expected fields: { first_name, last_name, call_sign }
export async function updateUser(id, fields) {
  const { query, values } = buildUpdateQuery("users", fields);
  values.push(id); // for WHERE clause
  const [result] = await db.execute(query, values);
  return result.affectedRows > 0 ? getUserById(id) : null;
}

// Update User Password
export async function updateUserPassword(id, passwordHash) {
  const [result] = await db.execute(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [passwordHash, id]
  );
  return result.affectedRows > 0;
}

// Update User Call Sign
export async function updateUserCallSign(id, callSign) {
  const [result] = await db.execute(
    "UPDATE users SET call_sign = ? WHERE id = ?",
    [callSign, id]
  );
  return result.affectedRows > 0;
}

// Delete User
export async function deleteUser(id) {
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

/// User Roles ///

// Get User Roles
export async function getUserRoles(id) {
  const userExists = await recordExists(db, "users", "id", id);
  if (!userExists) return null;

  const [results] = await db.execute(
    `SELECT r.id, r.name, rc.id as category_id, rc.name as category_name
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    JOIN role_categories rc ON r.category_id = rc.id
    WHERE ur.user_id = ?`,
    [id]
  );
  return results;
}

// Add Role to User
export async function addUserRole(id, roleId) {
  const [result] = await db.execute(
    "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
    [id, roleId]
  );
  return result.affectedRows > 0;
}

// Remove Role from User
export async function removeUserRole(id, roleId) {
  const [result] = await db.execute(
    "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
    [id, roleId]
  );
  return result.affectedRows > 0;
}

/// User Shifts ///

// Get User Shifts using pagination
export async function getUserShifts(id, page = 1, pageSize = 10) {
  const userExists = await recordExists(db, "users", "id", id);
  if (!userExists) return null;

  return await paginate(
    `SELECT
      id, role_id, start, end, duration_min
    FROM user_shifts WHERE user_id = ? ORDER BY start DESC`,
    page,
    pageSize,
    [id]
  );
}

// Get User Shift by ID
export async function getUserShift(id) {
  const [results] = await db.execute("SELECT * FROM user_shifts WHERE id = ?", [
    id,
  ]);
  return results[0];
}

// User Shift Clock In
// Expected fields: { user_id, role_id }
export async function clockInUserShift(fields) {
  // Check if user exists
  const userExists = await recordExists(db, "users", "id", fields.user_id);
  if (!userExists) return null;

  // Check if user already has an active shift
  const [activeShifts] = await db.execute(
    "SELECT COUNT(*) as count FROM user_shifts WHERE user_id = ? AND end IS NULL",
    [fields.user_id]
  );
  if (activeShifts[0].count > 0) return false;

  const { query, values } = buildInsertQuery("user_shifts", fields);
  const [result] = await db.execute(query, values);
  return getUserShift(result.insertId);
}

// User Shift Clock Out
export async function clockOutUserShift(user_id) {
  const userExists = await recordExists(db, "users", "id", user_id);
  if (!userExists) return null;

  const [shift] = await db.execute(
    "SELECT id FROM user_shifts WHERE user_id = ? AND end IS NULL LIMIT 1",
    [user_id]
  );
  if (shift.length === 0) return false; // No active shift found

  const [result] = await db.execute(
    "UPDATE user_shifts SET end = NOW() WHERE id = ?",
    [shift[0].id]
  );
  return result.affectedRows > 0 ? getUserShift(shift[0].id) : false;
}

// Update User Shift
// Expected fields: { role_id, start, end }
export async function updateUserShift(id, fields) {
  const { query, values } = buildUpdateQuery("user_shifts", fields);
  values.push(id); // for WHERE clause
  const [result] = await db.execute(query, values);
  return result.affectedRows > 0 ? getUserShift(id) : null;
}

// Delete User Shift
export async function deleteUserShift(id) {
  const [result] = await db.execute("DELETE FROM user_shifts WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

/// User Settings ///

// Get User Settings
export async function getUserSettings(id) {
  const userExists = await recordExists(db, "users", "id", id);
  if (!userExists) return null;

  const [results] = await db.execute(
    "SELECT * FROM user_settings WHERE user_id = ?",
    [id]
  );
  return results[0];
}

// Update User Settings
// Expected fields: { ... }
export async function updateUserSettings(id, fields) {
  const { query, values } = buildUpdateQuery(
    "user_settings",
    fields,
    [],
    "user_id"
  );
  values.push(id); // for WHERE clause
  const [result] = await db.execute(query, values);
  return result.affectedRows > 0;
}

/// User Notifications ///

// Get User Notifications using pagination
export async function getUserNotifications(id, page = 1, pageSize = 10) {
  const userExists = await recordExists(db, "users", "id", id);
  if (!userExists) return null;
  return await paginate(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    page,
    pageSize,
    [id]
  );
}

// Get User Notification by ID
// Private helper function
export async function getUserNotification(id) {
  const [results] = await db.execute(
    "SELECT * FROM notifications WHERE id = ?",
    [id]
  );
  return results[0];
}

// Create User Notification
// Expected fields: { type, title, message }
export async function createUserNotification(fields) {
  const userExists = await recordExists(db, "users", "id", fields.user_id);
  if (!userExists) return null;
  const { query, values } = buildInsertQuery("notifications", fields);
  const [result] = await db.execute(query, values);
  return getUserNotification(result.insertId);
}

// Mark Notification as Read
export async function markNotificationAsRead(id) {
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

// Delete Notification
export async function deleteNotification(id) {
  const [result] = await db.execute("DELETE FROM notifications WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}
