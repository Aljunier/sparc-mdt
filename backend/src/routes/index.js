import express from "express";

// Import route modules
import bolosRoutes from "./bolosRoutes.js";
import rolesRoutes from "./rolesRoutes.js";

const router = express.Router();

router.use("/bolos", bolosRoutes);
router.use("/roles", rolesRoutes);

export default router;
