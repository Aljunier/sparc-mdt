import express from "express";
import * as finesController from "./finesController.js";

const router = express.Router();

///  api/fines/  ///

// Create Fine
router.post("/", finesController.createFine);
// Update Fine
router.put("/:id", finesController.updateFine);
// Update Fine Status
router.patch("/:id/status", finesController.updateFineStatus);
// Delete Fine
router.delete("/:id", finesController.deleteFine);

export default router;
