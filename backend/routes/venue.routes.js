import express from "express";

import {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  checkVenueAvailability,
  findSuitableVenues,
  bookVenue,
} from "../controllers/venue.controller.js";

const router = express.Router();

// ==========================================
// VENUE CRUD
// ==========================================

router.post("/", createVenue);

router.get("/", getAllVenues);

router.get("/search", findSuitableVenues);

router.post("/:id/book", bookVenue);

router.get("/:id", getVenueById);

router.put("/:id", updateVenue);

router.delete("/:id", deleteVenue);

// ==========================================
// AVAILABILITY
// ==========================================

router.get(
  "/:id/availability",
  checkVenueAvailability
);

export default router;