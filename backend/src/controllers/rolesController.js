import * as Role from "../models/Role.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeBoolean,
} from "../utils/sanitize.js";
import { isValidInteger } from "../utils/validate.js";

// Roles //

// Get All Roles
export async function getAllRoles(_, res) {
  try {
    const roles = await Role.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error("[getAllRoles] Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(400).json({ message: "Invalid category ID" });
    }

    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return res.status(400).json({
        message: "Name is required and must be 50 characters or less",
      });
    }

    // Create
    const newRole = await Role.createRole(sanitizedData);
    res.status(201).json(newRole);
  } catch (error) {
    console.error("[createRole] Error creating role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update Role
export async function updateRole(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
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
      return res.status(400).json({ message: "Invalid category ID" });
    }

    if (!sanitizedData.name || sanitizedData.name.length > 50) {
      return res.status(400).json({
        message: "Name is required and must be 50 characters or less",
      });
    }

    // Update
    const updatedRole = await Role.updateRole(id, sanitizedData);
    if (!updatedRole)
      return res.status(404).json({ message: "Role not found" });
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error("[updateRole] Error updating role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Toggle Role Active Status
export async function toggleRoleActiveStatus(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // Toggle
    const updatedRole = await Role.toggleRoleActiveStatus(id);
    if (!updatedRole)
      return res.status(404).json({ message: "Role not found" });
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error(
      "[toggleRoleActiveStatus] Error toggling active status:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete Role
export async function deleteRole(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // Delete
    const deleted = await Role.deleteRole(id);
    if (!deleted) return res.status(404).json({ message: "Role not found" });
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("[deleteRole] Error deleting role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Role Categories //

// Get All Role Categories
export async function getAllRoleCategories(_, res) {
  try {
    const categories = await Role.getAllRoleCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error(
      "[getAllRoleCategories] Error fetching role categories:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(400).json({
        message: "Name is required and must be 50 characters or less",
      });
    }

    // Create
    const newCategory = await Role.createRoleCategory(sanitizedData);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("[createRoleCategory] Error creating role category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update Role Category
export async function updateRoleCategory(req, res) {
  try {
    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
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
      return res.status(400).json({
        message: "Name is required and must be 50 characters or less",
      });
    }

    // Update
    const updatedCategory = await Role.updateRoleCategory(id, sanitizedData);
    if (!updatedCategory)
      return res.status(404).json({ message: "Role category not found" });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("[updateRoleCategory] Error updating role category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Toggle Role Category Active Status
export async function toggleRoleCategoryActiveStatus(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Toggle
    const updatedCategory = await Role.toggleRoleCategoryActiveStatus(id);
    if (!updatedCategory)
      return res.status(404).json({ message: "Role category not found" });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(
      "[toggleRoleCategoryActiveStatus] Error toggling active status:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete Role Category
export async function deleteRoleCategory(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Delete
    const deleted = await Role.deleteRoleCategory(id);
    if (!deleted)
      return res.status(404).json({ message: "Role category not found" });
    res.status(200).json({ message: "Role category deleted successfully" });
  } catch (error) {
    console.error("[deleteRoleCategory] Error deleting role category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
