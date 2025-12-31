import express from "express";
import * as bolosController from "./bolosController.js";

const router = express.Router();

///  api/bolos/  ///

// Get all bolos (summary)
router.get("/", bolosController.getBoloSummary);

// Get specific bolo by ID
router.get("/:id", bolosController.getBolo);

// Create new bolo
router.post("/", bolosController.createBolo);

// Update existing bolo by ID
router.put("/:id", bolosController.updateBolo);

// Delete bolo by ID
router.delete("/:id", bolosController.deleteBolo);

///  api/bolos/vehicles/  ///

// Attach an existing vehicle to a specific bolo by bolo ID
router.post("/:bolo_id/vehicles/", bolosController.createBoloVehicle);

// Detach a vehicle from a specific bolo by bolo ID and vehicle ID
router.delete(
  "/:bolo_id/vehicles/:vehicle_id",
  bolosController.deleteBoloVehicle
);

///  api/bolos/persons/  ///

// Attach an existing person to a specific bolo by bolo ID
router.post("/:bolo_id/persons/", bolosController.createBoloPerson);

// Update a person attached to a specific bolo by bolo ID and person ID
router.put("/:bolo_id/persons/:person_id", bolosController.updateBoloPerson);

// Detach a person from a specific bolo by bolo ID and person ID
router.delete("/:bolo_id/persons/:person_id", bolosController.deleteBoloPerson);

export default router;
