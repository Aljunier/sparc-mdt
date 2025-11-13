import express from "express";

// Import route modules
import bolosRoutes from "./bolosRoutes.js";
import rolesRoutes from "./rolesRoutes.js";
import usersRoutes from "./usersRoutes.js";

const router = express.Router();

router.use("/bolos", bolosRoutes);
router.use("/roles", rolesRoutes);
router.use("/users", usersRoutes);

export default router;
