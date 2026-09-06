import express from "express";

import {
  getExecutiveDashboard,
} from "../controllers/executiveDashboard.controller.js";

const router = express.Router();

router.get(
  "/",
  getExecutiveDashboard
);

export default router;