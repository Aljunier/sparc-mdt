import express from "express";
import * as vehiclesController from "../controllers/vehiclesController.js";

const router = express.Router();

///  api/vehicles/  ///

// Search Vehicles
router.get("/search/", vehiclesController.searchVehicles);
// Get Vehicle by id
router.get("/:id", vehiclesController.getVehicleById);
// Create Vehicle
router.post("/", vehiclesController.createVehicle);
// Update Vehicle
router.put("/:id", vehiclesController.updateVehicle);
// Delete Vehicle
router.delete("/:id", vehiclesController.deleteVehicle);

export default router;
