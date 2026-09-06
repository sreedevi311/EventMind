import express from "express";
import {
  eventIntelligenceChat,
} from "../controllers/eventIntelligence.controller.js";

const router = express.Router();

router.post("/chat", eventIntelligenceChat);

export default router;