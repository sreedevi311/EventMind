import express from "express";

import {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  getIncidentAnalytics,
  incidentAgentChat,
  getOperationalAlerts,
} from "../controllers/incident.controller.js";

const router = express.Router();

// ==========================================
// INCIDENT MANAGEMENT
// ==========================================

router.post(
  "/",
  createIncident
);

router.get(
  "/",
  getAllIncidents
);

router.get(
  "/analytics",
  getIncidentAnalytics
);

router.get(
  "/alerts",
  getOperationalAlerts
);

router.get(
  "/:id",
  getIncidentById
);

router.patch(
  "/:id/status",
  updateIncidentStatus
);
// ==========================================
// INCIDENT AI AGENT
// ==========================================

router.post(
  "/chat",
  incidentAgentChat
);

export default router;