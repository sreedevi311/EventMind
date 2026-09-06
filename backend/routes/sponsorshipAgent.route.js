import express from "express";

import {
  sponsorshipAgentChat,
} from "../controllers/sponsorshipAgent.controller.js";

const router = express.Router();

router.post(
  "/chat",
  sponsorshipAgentChat
);

export default router;