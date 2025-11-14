import * as User from "../models/Users.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeDate,
} from "../utils/sanitize.js";
import {
  isNonEmptyString,
  isValidInteger,
  isValidDate,
  validateUserNotification,
  validatePaginationParams,
  validateUser,
} from "../utils/validate.js";
import * as api from "../utils/apiResponse.js";
import { logAct } from "../utils/logActivity.js";

/// Users ///

// Get User by id
export async function getUserById(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Fetch
    const user = await User.getUserById(id);
    if (!user) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, user, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserById");
  }
}

// Create User
export async function createUser(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      username: sanitizeString(body.username.trim()),
      password_hash: sanitizeString(body.password),
      first_name: sanitizeString(body.first_name),
      last_name: sanitizeString(body.last_name),
      call_sign: sanitizeString(body.call_sign),
    };

    // Validate
    const { valid, errors } = validateUser(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create
    const newUser = await User.createUser(sanitizedData);
    api.sendSuccess(res, newUser, 201);

    // Log
    logAct({
      user_id: newUser.id,
      entity_type: "user",
      action: "create",
      entity_id: newUser.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "createUser");
  }
}

// Update User
export async function updateUser(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const sanitizedData = {
      first_name: sanitizeString(body.first_name),
      last_name: sanitizeString(body.last_name),
      call_sign: sanitizeString(body.call_sign),
    };

    // Validate
    const { valid, errors } = validateUser(sanitizedData, false);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update
    const updatedUser = await User.updateUser(id, sanitizedData);
    if (!updatedUser) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, updatedUser, 200);

    // Log
    logAct({
      user_id: id,
      entity_type: "user",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateUser");
  }
}

// Update User Password
export async function updateUserPassword(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const newPasswordHash = sanitizeString(body.password);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    if (!isNonEmptyString(newPasswordHash) || newPasswordHash.length < 8) {
      return api.sendError(
        res,
        400,
        "Password must be at least 8 characters long"
      );
    }

    // Update
    const updated = await User.updateUserPassword(id, newPasswordHash);
    if (!updated) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, null, 200);

    // Log
    logAct({
      user_id: id,
      entity_type: "user",
      action: "update_password",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateUserPassword");
  }
}

// Update User Call Sign
export async function updateUserCallSign(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const newCallSign = sanitizeString(body.call_sign);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    if (!isNonEmptyString(newCallSign) || newCallSign.length > 10) {
      return api.sendError(res, 400, "Invalid call sign");
    }

    // Update
    const updated = await User.updateUserCallSign(id, newCallSign);
    if (!updated) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, null, 200);

    // Log
    logAct({
      user_id: id,
      entity_type: "user",
      action: "update_call_sign",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateUserCallSign");
  }
}

// Delete User
export async function deleteUser(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Delete
    const deleted = await User.deleteUser(id);
    if (!deleted) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, { message: "User deleted" });

    // Log
    logAct({
      user_id: null,
      entity_type: "user",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deleteUser");
  }
}

/// User Roles ///

// Get User Roles
export async function getUserRoles(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.user_id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Fetch
    const roles = await User.getUserRoles(id);
    if (!roles) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, roles, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserRoles");
  }
}

// Add Role to User
export async function addUserRole(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.user_id);
    const roleId = sanitizeInteger(req.params.role_id);

    // Validate
    if (!isValidInteger(id) || !isValidInteger(roleId)) {
      return api.sendError(res, 400, "Invalid user id or role id");
    }

    // Add Role
    const added = await User.addUserRole(id, roleId);
    if (!added)
      return api.sendError(res, 400, "Role could not be added to user");
    api.sendSuccess(res, null, 200);

    // Log
    logAct({
      user_id: null,
      entity_type: "user_role",
      action: "add_role",
      entity_id: `${id}-${roleId}`,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "addUserRole");
  }
}

// Remove Role from User
export async function removeUserRole(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.user_id);
    const roleId = sanitizeInteger(req.params.role_id);

    // Validate
    if (!isValidInteger(id) || !isValidInteger(roleId)) {
      return api.sendError(res, 400, "Invalid user id or role id");
    }

    // Remove Role
    const removed = await User.removeUserRole(id, roleId);
    if (!removed)
      return api.sendError(res, 400, "Role could not be removed from user");
    api.sendSuccess(res, null, 200);

    // Log
    logAct({
      user_id: null,
      entity_type: "user_role",
      action: "remove_role",
      entity_id: `${id}-${roleId}`,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "removeUserRole");
  }
}

/// User Settings ///

// Get User Settings
export async function getUserSettings(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.user_id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Fetch
    const settings = await User.getUserSettings(id);
    if (!settings) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, settings, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserSettings");
  }
}

// Update User Settings
export async function updateUserSettings(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.user_id);
    const body = req.body;
    const sanitizedData = {}; // TODO: Add specific sanitization based on expected settings fields

    // For now, we will just pass the body as is
    Object.assign(sanitizedData, body);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // TODO: Add specific validation for user settings if needed

    // Update
    const updatedSettings = await User.updateUserSettings(id, body);
    if (!updatedSettings) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, updatedSettings, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateUserSettings");
  }
}

/// User Shifts ///

// Get User Shifts
export async function getUserShifts(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.user_id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Fetch
    const shifts = await User.getUserShifts(id);
    if (!shifts) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, shifts, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserShifts");
  }
}

// Get User Shift by id
export async function getUserShiftById(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.shift_id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid shift id");
    }

    // Fetch
    const shift = await User.getUserShift(id);
    if (!shift) return api.sendError(res, 404, "Shift not found");
    api.sendSuccess(res, shift, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserShiftById");
  }
}

// Create User Shift (Clock In)
export async function clockInUserShift(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      user_id: sanitizeInteger(req.params.user_id),
      role_id: sanitizeInteger(body.role_id),
    };

    // Validate
    if (
      !isValidInteger(sanitizedData.user_id) ||
      !isValidInteger(sanitizedData.role_id)
    ) {
      return api.sendError(res, 400, "Invalid user id or role id");
    }

    // Create
    const newShift = await User.clockInUserShift(sanitizedData);
    if (newShift === null) {
      return api.sendError(res, 400, "User does not exist");
    } else if (newShift === false) {
      return api.sendError(res, 400, "User already has an active shift");
    }
    api.sendSuccess(res, newShift, 201);

    // Log
    logAct({
      user_id: sanitizedData.user_id,
      entity_type: "user_shift",
      action: "clock_in",
      entity_id: newShift.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "clockInUserShift");
  }
}

// User Shift Clock Out
export async function clockOutUserShift(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const user_id = sanitizeInteger(req.params.user_id);
    if (!isValidInteger(user_id)) {
      return api.sendError(res, 400, "Invalid user id");
    }

    // Update
    const clockedOutShift = await User.clockOutUserShift(user_id);
    if (clockedOutShift === null) {
      return api.sendError(res, 400, "User does not exist");
    } else if (clockedOutShift === false) {
      return api.sendError(res, 400, "No active shift found for user");
    }
    api.sendSuccess(res, clockedOutShift, 200);

    // Log
    logAct({
      user_id: user_id,
      entity_type: "user_shift",
      action: "clock_out",
      entity_id: clockedOutShift.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "clockOutUserShift");
  }
}

// Update User Shift
export async function updateUserShift(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.shift_id);
    const body = req.body;
    const sanitizedData = {
      role_id: sanitizeInteger(body.role_id),
      start: sanitizeDate(body.start),
      end: sanitizeDate(body.end),
    };

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid shift id");
    }
    if (body.role_id && !isValidInteger(sanitizedData.role_id)) {
      return api.sendError(res, 400, "Invalid role id");
    }
    if (body.start && !isValidDate(sanitizedData.start)) {
      return api.sendError(res, 400, "Invalid start date");
    }
    if (body.end && !isValidDate(sanitizedData.end)) {
      return api.sendError(res, 400, "Invalid end date");
    }

    // Update
    const updatedShift = await User.updateUserShift(id, sanitizedData);
    if (!updatedShift) return api.sendError(res, 404, "Shift not found");
    api.sendSuccess(res, updatedShift, 200);

    // Log
    logAct({
      user_id: updatedShift.user_id,
      entity_type: "user_shift",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateUserShift");
  }
}

// Delete User Shift
export async function deleteUserShift(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.shift_id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid shift id");
    }

    // Delete
    const deleted = await User.deleteUserShift(id);
    if (!deleted) return api.sendError(res, 404, "Shift not found");
    api.sendSuccess(res, { message: "Shift deleted" });

    // Log
    logAct({
      user_id: null,
      entity_type: "user_shift",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deleteUserShift");
  }
}

/// User Notifications ///

// Get User Notifications
export async function getUserNotifications(req, res) {
  try {
    // Sanitize
    const userId = sanitizeInteger(req.params.user_id);
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
    if (!result) return api.sendError(res, 404, "User not found");
    api.sendSuccess(res, result, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getUserNotifications");
  }
}

// Create User Notification
export async function createUserNotification(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      user_id: sanitizeInteger(req.params.user_id),
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
    if (!newNotification) return api.sendError(res, 400, "User not found");
    api.sendSuccess(res, newNotification, 201);
  } catch (error) {
    return api.handleDatabaseError(error, res, "createUserNotification");
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
    return api.handleDatabaseError(error, res, "markNotificationAsRead");
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
    return api.handleDatabaseError(error, res, "deleteNotification");
  }
}
