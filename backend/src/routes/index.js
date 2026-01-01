import express from "express";

// Import route modules
import bolosRoutes from "#modules/bolos/bolosRoutes";
import warrantsRoutes from "#modules/warrants/warrantsRoutes";
import rolesRoutes from "#modules/roles/rolesRoutes";
import usersRoutes from "#modules/users/usersRoutes";
import vehiclesRoutes from "#modules/vehicles/vehiclesRoutes";
import personsRoutes from "#modules/persons/personsRoutes";
import statutesRoutes from "#modules/statutes/statutesRoutes";
import finesRoutes from "#modules/fines/finesRoutes";

const router = express.Router();

router.use("/bolos", bolosRoutes);
router.use("/warrants", warrantsRoutes);
router.use("/roles", rolesRoutes);
router.use("/users", usersRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/persons", personsRoutes);
router.use("/statutes", statutesRoutes);
router.use("/fines", finesRoutes);

export default router;
