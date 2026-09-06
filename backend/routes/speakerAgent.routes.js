import express from "express";

import {
  speakerAgentChat,
  assignSpeaker,
} from "../controllers/speakerAgent.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/chat",
  authMiddleware,
  speakerAgentChat
);

router.post(
  "/:speakerId/assign",
  authMiddleware,
  assignSpeaker
);

export default router;