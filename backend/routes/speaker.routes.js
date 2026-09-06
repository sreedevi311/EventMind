import express from "express";

import {
  createSpeaker,
  getAllSpeakers,
  getSpeakerById,
  updateSpeaker,
  deleteSpeaker,
  findSuitableSpeakers,
  checkSpeakerAvailability,
} from "../controllers/speaker.controller.js";

const router = express.Router();

// ==========================================
// SPEAKER CRUD
// ==========================================

router.post("/", createSpeaker);

router.get("/", getAllSpeakers);

router.get("/search", findSuitableSpeakers);

router.get("/:id", getSpeakerById);

router.put("/:id", updateSpeaker);

router.delete("/:id", deleteSpeaker);

// ==========================================
// SPEAKER AVAILABILITY
// ==========================================

router.get(
  "/:id/availability",
  checkSpeakerAvailability
);

export default router;