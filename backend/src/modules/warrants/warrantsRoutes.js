import express from "express";
import * as warrantsController from "./warrantsController.js";

const router = express.Router();

///  api/warrants/  ///

// Get all warrants (summary)
router.get("/", warrantsController.getWarrantSummary);

// Get specific warrant by ID
router.get("/:id", warrantsController.getWarrant);

// Create new warrant
router.post("/", warrantsController.createWarrant);

// Update existing warrant by ID
router.put("/:id", warrantsController.updateWarrant);

// Delete warrant by ID
router.delete("/:id", warrantsController.deleteWarrant);

export default router;
