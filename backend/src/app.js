import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import eventRoutes from "../routes/event.route.js";
import registrationRoutes from "../routes/registration.route.js";
import aiRoutes from "../routes/ai.route.js";
import authRoutes from "../routes/auth.route.js";
import checkInRoutes from "../routes/checkin.route.js";
import analyticsRoutes from "../routes/analytics.route.js";
import analyticsAIRoutes from "../routes/analytics.ai.route.js";

import venueRoutes from "../routes/venue.routes.js";
import speakerRoutes from "../routes/speaker.routes.js";
import venueAgentRoutes from "../routes/venueAgent.routes.js";
import speakerAgentRoute from "../routes/speakerAgent.routes.js";

import sponsorRoutes from "../routes/sponsor.route.js";
import sponsorshipAgentRoutes from "../routes/sponsorshipAgent.route.js";
import incidentRoutes from "../routes/incident.route.js";

import eventIntelligenceRoutes from "../routes/eventIntelligence.route.js";
import executiveDashboardRoutes from "../routes/executiveDashboard.route.js";
import agentOrchestratorRoutes from "../routes/agentOrchestrator.route.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/analytics/ai-insights", analyticsAIRoutes);

app.use("/api/venues", venueRoutes);
app.use("/api/speakers", speakerRoutes);
app.use("/api/venue-agent", venueAgentRoutes);
app.use("/api/speaker-agent", speakerAgentRoute);

app.use("/api/sponsors", sponsorRoutes);
app.use("/api/sponsorship-agent", sponsorshipAgentRoutes);
app.use("/api/incidents", incidentRoutes);

app.use("/api/event-intelligence", eventIntelligenceRoutes);
app.use("/api/executive-dashboard", executiveDashboardRoutes);
app.use("/api/agent-orchestrator", agentOrchestratorRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Intelligent Event Management API Running 🚀",
  });
});

export default app;
