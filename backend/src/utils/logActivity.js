import db from "../database/db.js";

export async function logActivity({
  user_id,
  entity_type,
  action,
  entitiy_id = null,
}) {
  try {
    if (!user_id || !entity_type || !action) {
      console.warn("[logActivity] Missing required parameters:", {
        user_id,
        entity_type,
        action,
        entitiy_id,
      });
      return;
    }
    const query = `INSERT INTO activity_logs (user_id, entity_type, action, entitiy_id) VALUES (?,?,?,?)`;
    await db.execute(query, [user_id, entity_type, action, entitiy_id]);

    // Log for debugging purposes
    if (process.env.NODE_ENV !== "production")
      console.log(
        `[logActivity] Logged activity: user_id=${user_id}, entity_type=${entity_type}, action=${action}, entitiy_id=${entitiy_id}`
      );
  } catch (error) {
    console.error("[logActivity] Error logging activity:", error);
  }
}
