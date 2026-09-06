import express from "express";

import {
  orchestratorChat,
} from "../controllers/agentOrchestrator.controller.js";

const router = express.Router();

router.post(
  "/chat",
  orchestratorChat
);

export default router;