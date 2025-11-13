import express from "express";
import * as usersController from "../controllers/usersController.js";

const router = express.Router();

///   api/users/notifications   ///

// Get User Notifications
router.get("/:userId/notifications", usersController.getUserNotifications);

// Create User Notification
router.post("/:userId/notifications", usersController.createUserNotification);

// Mark Notification as Read
router.patch(
  "/notifications/:id/mark-read",
  usersController.markNotificationAsRead
);

// Delete Notification
router.delete("/notifications/:id", usersController.deleteNotification);

export default router;
