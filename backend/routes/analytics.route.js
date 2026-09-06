import express from "express";
import {
  getOverview,
  getDemographics,
  getCheckInAnalytics,
  getRegistrationTrends,
  getSessionAnalytics,
} from "../controllers/analytics.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/overview/:eventId", authMiddleware, getOverview);

router.get("/demographics/:eventId", authMiddleware, getDemographics);

router.get("/checkins/:eventId", authMiddleware, getCheckInAnalytics);

router.get("/trends/:eventId", authMiddleware, getRegistrationTrends);

router.get("/session/:eventId", authMiddleware, getSessionAnalytics);
export default router;