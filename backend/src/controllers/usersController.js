import * as User from "../models/Users.js";
import { sanitizeString, sanitizeInteger } from "../utils/sanitize.js";
import {
  isValidInteger,
  validateUserNotification,
  validatePaginationParams,
} from "../utils/validate.js";
import * as api from "../utils/apiResponse.js";
import { logAct } from "../utils/logActivity.js";

// User Notifications //

// Get User Notifications
export async function getUserNotifications(req, res) {
  try {
    // Sanitize
    const userId = sanitizeInteger(req.params.userId);
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.limit) || 10;

    // Validate
    if (!isValidInteger(userId)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Invalid pagination parameters", errors);
    }

    // Get notifications
    const result = await User.getUserNotifications(userId, page, pageSize);
    api.sendSuccess(res, result, 200);
  } catch (error) {
    console.error(
      "[getUserNotifications] Error fetching notifications:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Create User Notification
export async function createUserNotification(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      user_id: sanitizeInteger(req.params.userId),
      type: sanitizeString(body.type),
      title: sanitizeString(body.title),
      message: sanitizeString(body.message),
    };

    // Validate
    const { valid, errors } = validateUserNotification(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create
    const newNotification = await User.createUserNotification(sanitizedData);
    api.sendSuccess(res, newNotification, 201);
  } catch (error) {
    console.error(
      "[createUserNotification] Error creating notification:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Mark Notification as Read
export async function markNotificationAsRead(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);

    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid notification id");
    }

    // Mark as read
    const markedRead = await User.markNotificationAsRead(id);
    if (markedRead) {
      api.sendSuccess(res, null, 200);
    } else {
      return api.sendError(res, 404, "Notification not found");
    }
  } catch (error) {
    console.error(
      "[markNotificationAsRead] Error marking notification as read:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Delete Notification
export async function deleteNotification(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);

    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid notification id");
    }

    // Delete
    const deleted = await User.deleteNotification(id);
    if (deleted) {
      api.sendSuccess(res, { message: "Notification deleted" });
    } else {
      return api.sendError(res, 404, "Notification not found");
    }
  } catch (error) {
    console.error("[deleteNotification] Error deleting notification:", error);
    api.sendError(res, 500, "Internal server error");
  }
}
