import express from "express";

// Import route modules
import bolosRoutes from "./bolosRoutes.js";

const router = express.Router();

router.use("/bolos", bolosRoutes);

export default router;
