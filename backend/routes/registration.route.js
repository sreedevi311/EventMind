import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  deleteRegistration,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createRegistration);

router.get("/", getAllRegistrations);

router.get("/:id", getRegistrationById);

router.delete("/:id", deleteRegistration);

export default router;