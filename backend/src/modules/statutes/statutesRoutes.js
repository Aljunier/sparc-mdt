import express from "express";
import * as statutesController from "./statutesController.js";

const router = express.Router();

///  api/statutes/  ///

// Search Statutes
router.get("/search/", statutesController.searchStatutes);
// Get Statute by id
router.get("/:id", statutesController.getStatuteById);
// Create Statute
router.post("/", statutesController.createStatute);
// Update Statute
router.put("/:id", statutesController.updateStatute);
// Toggle Statute Active Status
router.patch("/:id/toggle-active", statutesController.toggleStatuteStatus);
// Delete Statute
router.delete("/:id", statutesController.deleteStatute);

export default router;
