import { dbPool as db } from "../config/database.js";
import { buildInsertQuery } from "../utils/sqlHelpers.js";
import { paginate } from "../utils/pagination.js";

// User Notifications //

// Get User Notifications using pagination
export async function getUserNotifications(userId, page = 1, pageSize = 10) {
  return await paginate(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    page,
    pageSize,
    [userId]
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
