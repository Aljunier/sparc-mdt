import express from "express";
import * as usersController from "./usersController.js";

const router = express.Router();

///  api/users   ///

// Get User by id
router.get("/:id", usersController.getUserById);
// Create User
router.post("/", usersController.createUser);
// Update User
router.put("/:id", usersController.updateUser);
// Update User Password
router.patch("/:id/password", usersController.updateUserPassword);
// Update User Call Sign
router.patch("/:id/call-sign", usersController.updateUserCallSign);
// Delete User
router.delete("/:id", usersController.deleteUser);

/// api/users/roles   ///

// Get User Roles
router.get("/:user_id/roles", usersController.getUserRoles);
// Add Role to User
router.post("/:user_id/roles/:role_id", usersController.addUserRole);
// Remove Role from User
router.delete("/:user_id/roles/:role_id", usersController.removeUserRole);

/// api/users/shifts   ///

// Get User Shifts
router.get("/:user_id/shifts", usersController.getUserShifts);
// Get User Shift by id
router.get("/shifts/:shift_id", usersController.getUserShiftById);
// Clock In User Shift
router.post("/:user_id/shifts/clock-in", usersController.clockInUserShift);
// Clock Out User Shift
router.patch("/:user_id/shifts/clock-out", usersController.clockOutUserShift);
// Update User Shift
router.put("/shifts/:shift_id", usersController.updateUserShift);
// Delete User Shift
router.delete("/shifts/:shift_id", usersController.deleteUserShift);

/// api/users/settings   ///

// Get User Settings
router.get("/:user_id/settings", usersController.getUserSettings);
// Update User Settings
router.put("/:user_id/settings", usersController.updateUserSettings);

///   api/users/notifications   ///

// Get User Notifications
router.get("/:user_id/notifications", usersController.getUserNotifications);
// Create User Notification
router.post("/:user_id/notifications", usersController.createUserNotification);
// Mark Notification as Read
router.patch(
  "/notifications/:id/mark-read",
  usersController.markNotificationAsRead
);
// Delete Notification
router.delete("/notifications/:id", usersController.deleteNotification);

export default router;
