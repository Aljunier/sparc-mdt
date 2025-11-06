import express from "express";
import * as bolosController from "../controllers/bolosController.js";

const router = express.Router();

// api/bolos/
router.get("/", bolosController.getBoloSummary);
router.get("/:id", bolosController.getBolo);
router.post("/", bolosController.createBolo);
router.put("/:id", bolosController.updateBolo);
router.delete("/:id", bolosController.deleteBolo);

// api/bolos/vehicles/
router.post("/:bolo_id/vehicles/", bolosController.createBoloVehicle);
router.delete("/:bolo_id/vehicles/:id", bolosController.deleteBoloVehicle);

// api/bolos/persons/
router.post("/:bolo_id/persons/", bolosController.createBoloPerson);
router.put("/:bolo_id/persons/:id", bolosController.updateBoloPerson);
router.delete("/:bolo_id/persons/:id", bolosController.deleteBoloPerson);

export default router;
