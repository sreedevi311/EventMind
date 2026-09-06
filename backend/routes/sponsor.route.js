import express from "express";

import {
  createSponsor,
  getSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
} from "../controllers/sponsor.controller.js";

const router = express.Router();

router.post("/", createSponsor);

router.get("/", getSponsors);

router.get("/:id", getSponsorById);

router.put("/:id", updateSponsor);

router.delete("/:id", deleteSponsor);

export default router;