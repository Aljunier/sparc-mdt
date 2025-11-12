import express from "express";
import * as rolesController from "../controllers/rolesController.js";

const router = express.Router();

///   api/roles/   ///

// Get all roles
router.get("/", rolesController.getAllRoles);

// Create new role
router.post("/", rolesController.createRole);

// Update existing role by ID
router.put("/:id", rolesController.updateRole);

// Toggle role active status by ID
router.patch("/:id/toggle-active", rolesController.toggleRoleActiveStatus);

// Delete role by ID
router.delete("/:id", rolesController.deleteRole);

///  api/roles/categories/  ///

// Get all role categories
router.get("/categories/", rolesController.getAllRoleCategories);

// Create new role category
router.post("/categories/", rolesController.createRoleCategory);

// Update existing role category by ID
router.put("/categories/:id", rolesController.updateRoleCategory);

// Toggle role category active status by ID
router.patch(
  "/categories/:id/toggle-active",
  rolesController.toggleRoleCategoryActiveStatus
);

// Delete role category by ID
router.delete("/categories/:id", rolesController.deleteRoleCategory);

export default router;
