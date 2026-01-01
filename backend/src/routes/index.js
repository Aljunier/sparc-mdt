import express from "express";

// Import route modules
import bolosRoutes from "./bolosRoutes.js";
import warrantsRoutes from "./warrantsRoutes.js";
import rolesRoutes from "./rolesRoutes.js";
import usersRoutes from "./usersRoutes.js";
import vehiclesRoutes from "./vehiclesRoutes.js";
import statutesRoutes from "./statutesRoutes.js";

const router = express.Router();

router.use("/bolos", bolosRoutes);
router.use("/warrants", warrantsRoutes);
router.use("/roles", rolesRoutes);
router.use("/users", usersRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/statutes", statutesRoutes);

export default router;
