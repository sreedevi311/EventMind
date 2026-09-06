import express from "express";
import { registerAgent } from "../controllers/ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authMiddleware, registerAgent);

export default router;