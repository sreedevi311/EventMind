import express from "express";
import { getAIInsights } from "../controllers/analytics.ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:eventId", authMiddleware, getAIInsights);

export default router;