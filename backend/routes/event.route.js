import express from "express";

import {
  getAllEvents,
  getEventById,
  getRegistrationFields,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getAllEvents);

router.get("/:id", getEventById);

router.get("/:id/registration-fields", getRegistrationFields);

export default router;