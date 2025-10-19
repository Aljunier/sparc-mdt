import express from "express";
import {
  getBoloList,
  getAllBolos,
  getBolo,
  createBolo,
  updateBolo,
  deleteBolo,
} from "../controllers/bolosController.js";

const router = express.Router();

router.get("/", getBoloList);
router.get("/all/", getAllBolos);
router.get("/:id", getBolo);
router.post("/", createBolo);
router.put("/:id", updateBolo);
router.delete("/:id", deleteBolo);

export default router;
