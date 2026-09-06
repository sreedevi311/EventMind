import express from "express";
import {
  venueAgentChat,
} from "../controllers/venueAgent.controller.js";

const router = express.Router();

// ==========================================
// VENUE AGENT CHAT
// ==========================================

router.post("/chat", venueAgentChat);

export default router;