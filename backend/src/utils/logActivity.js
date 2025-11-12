import { dbPool as db } from "../config/database.js";

export async function logActivity({
  user_id,
  entity_type,
  action,
  entity_id = null,
}) {
  try {
    if (!entity_type || !action) {
      console.warn("[logActivity] Missing required parameters:", {
        user_id,
        entity_type,
        action,
        entity_id,
      });
      return;
    }
    const query = `INSERT INTO activity_logs (user_id, entity_type, action, entity_id) VALUES (?,?,?,?)`;
    await db.execute(query, [user_id, entity_type, action, entity_id]);

    // Log for debugging purposes
    if (process.env.NODE_ENV !== "production")
      console.log(
        `[logActivity] Logged activity: user_id=${user_id}, entity_type=${entity_type}, action=${action}, entity_id=${entity_id}`
      );
  } catch (error) {
    console.error("[logActivity] Error logging activity:", error);
  }
}
