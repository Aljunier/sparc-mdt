import * as User from "../models/Users.js";
import { sanitizeString, sanitizeInteger } from "../utils/sanitize.js";
import { isValidInteger, validateUserNotification } from "../utils/validate.js";

// User Notifications //

// Get User Notifications
export async function getUserNotifications(req, res) {
  try {
    // Sanitize
    const userId = sanitizeInteger(req.params.userId);
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.pageSize) || 10;

    // Validate
    if (!isValidInteger(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (
      !isValidInteger(page) ||
      page < 1 ||
      !isValidInteger(pageSize) ||
      pageSize < 1
    ) {
      return res
        .status(400)
        .json({ message: "Page and page size must be positive integers" });
    }

    // Get notifications
    const result = await User.getUserNotifications(userId, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "[getUserNotifications] Error fetching notifications:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(400).json({ message: "Validation errors", errors });
    }

    // Create
    const newNotification = await User.createUserNotification(sanitizedData);
    res.status(201).json(newNotification);
  } catch (error) {
    console.error(
      "[createUserNotification] Error creating notification:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// Mark Notification as Read
export async function markNotificationAsRead(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);

    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    // Mark as read
    const markedRead = await User.markNotificationAsRead(id);
    if (markedRead) {
      res.status(200).json();
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error(
      "[markNotificationAsRead] Error marking notification as read:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete Notification
export async function deleteNotification(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);

    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    // Delete
    const deleted = await User.deleteNotification(id);
    if (deleted) {
      res.status(200).json({ message: "Notification deleted" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error("[deleteNotification] Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
