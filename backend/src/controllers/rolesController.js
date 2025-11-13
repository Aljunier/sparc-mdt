import * as Role from "../models/Role.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeBoolean,
} from "../utils/sanitize.js";
import { isValidInteger } from "../utils/validate.js";
import * as api from "../utils/apiResponse.js";
import { logAct } from "../utils/logActivity.js";

// Roles //

// Get All Roles
export async function getAllRoles(_, res) {
  try {
    const roles = await Role.getAllRoles();
    api.sendSuccess(res, 200, roles);
  } catch (error) {
    console.error("[getAllRoles] Error fetching roles:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Create Role
export async function createRole(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      category_id: sanitizeInteger(body.categoryId),
      name: sanitizeString(body.name),
      is_active:
        body.is_active !== undefined ? sanitizeBoolean(body.is_active) : null,
    };

    // Validate
    if (!isValidInteger(sanitizedData.category_id)) {
      return api.sendError(res, 400, "Invalid category id");
    }

    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return api.sendError(
        res,
        400,
        "Name is required and must be 50 characters or less"
      );
    }

    // Create
    const newRole = await Role.createRole(sanitizedData);
    api.sendSuccess(res, 201, newRole);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role",
      action: "create",
      entity_id: newRole.id,
    });
  } catch (error) {
    console.error("[createRole] Error creating role:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Update Role
export async function updateRole(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid role id");
    }

    // Sanitize
    const body = req.body;
    const sanitizedData = {
      category_id: sanitizeInteger(body.categoryId),
      name: sanitizeString(body.name),
      is_active:
        body.is_active !== undefined ? sanitizeBoolean(body.is_active) : null,
    };

    // Validate
    if (!isValidInteger(sanitizedData.category_id)) {
      return api.sendError(res, 400, "Invalid category id");
    }

    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return api.sendError(
        res,
        400,
        "Name is required and must be 50 characters or less"
      );
    }

    // Update
    const updatedRole = await Role.updateRole(id, sanitizedData);
    if (!updatedRole) return api.sendError(res, 404, "Role not found");
    api.sendSuccess(res, 200, updatedRole);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role",
      action: "update",
      entity_id: updatedRole.id,
    });
  } catch (error) {
    console.error("[updateRole] Error updating role:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Toggle Role Active Status
export async function toggleRoleActiveStatus(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid role id");
    }

    // Toggle
    const updatedRole = await Role.toggleRoleActiveStatus(id);
    if (!updatedRole) return api.sendError(res, 404, "Role not found");
    api.sendSuccess(res, 200, updatedRole);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role",
      action: "toggle_active_status",
      entity_id: updatedRole.id,
    });
  } catch (error) {
    console.error(
      "[toggleRoleActiveStatus] Error toggling active status:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Delete Role
export async function deleteRole(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid role ID");
    }

    // Delete
    const deleted = await Role.deleteRole(id);
    if (!deleted) return api.sendError(res, 404, "Role not found");
    api.sendSuccess(res, 200, { message: "Role deleted successfully" });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role",
      action: "delete",
      entity_id: id,
    });
  } catch (error) {
    console.error("[deleteRole] Error deleting role:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Role Categories //

// Get All Role Categories
export async function getAllRoleCategories(_, res) {
  try {
    const categories = await Role.getAllRoleCategories();
    api.sendSuccess(res, 200, categories);
  } catch (error) {
    console.error(
      "[getAllRoleCategories] Error fetching role categories:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Create Role Category
export async function createRoleCategory(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      name: sanitizeString(body.name),
      is_active:
        body.is_active !== undefined ? sanitizeBoolean(body.is_active) : null,
    };

    // Validate
    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return api.sendError(
        res,
        400,
        "Name is required and must be 50 characters or less"
      );
    }

    // Create
    const newCategory = await Role.createRoleCategory(sanitizedData);
    api.sendSuccess(res, 201, newCategory);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role_category",
      action: "create",
      entity_id: newCategory.id,
    });
  } catch (error) {
    console.error("[createRoleCategory] Error creating role category:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Update Role Category
export async function updateRoleCategory(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid category id");
    }

    // Sanitize
    const body = req.body;
    const sanitizedData = {
      name: sanitizeString(body.name),
      is_active:
        body.is_active !== undefined ? sanitizeBoolean(body.is_active) : null,
    };

    // Validate
    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return api.sendError(
        res,
        400,
        "Name is required and must be 50 characters or less"
      );
    }

    // Update
    const updatedCategory = await Role.updateRoleCategory(id, sanitizedData);
    if (!updatedCategory)
      return api.sendError(res, 404, "Role category not found");
    api.sendSuccess(res, 200, updatedCategory);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role_category",
      action: "update",
      entity_id: updatedCategory.id,
    });
  } catch (error) {
    console.error("[updateRoleCategory] Error updating role category:", error);
    api.sendError(res, 500, "Internal server error");
  }
}

// Toggle Role Category Active Status
export async function toggleRoleCategoryActiveStatus(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid category id");
    }

    // Toggle
    const updatedCategory = await Role.toggleRoleCategoryActiveStatus(id);
    if (!updatedCategory)
      return api.sendError(res, 404, "Role category not found");
    api.sendSuccess(res, 200, updatedCategory);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role_category",
      action: "toggle_active_status",
      entity_id: updatedCategory.id,
    });
  } catch (error) {
    console.error(
      "[toggleRoleCategoryActiveStatus] Error toggling active status:",
      error
    );
    api.sendError(res, 500, "Internal server error");
  }
}

// Delete Role Category
export async function deleteRoleCategory(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid category id");
    }

    // Delete
    const deleted = await Role.deleteRoleCategory(id);
    if (!deleted) return api.sendError(res, 404, "Role category not found");
    api.sendSuccess(res, 200, {
      message: "Role category deleted successfully",
    });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "role_category",
      action: "delete",
      entity_id: id,
    });
  } catch (error) {
    console.error("[deleteRoleCategory] Error deleting role category:", error);
    api.sendError(res, 500, "Internal server error");
  }
}
