import express from "express";
import {
  checkIn,
  getCheckInStatus,
  getAllCheckIns,
} from "../controllers/checkin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, checkIn);

router.get("/", authMiddleware, getAllCheckIns);

router.get("/:registrationId", authMiddleware, getCheckInStatus);

export default router;