import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Session from "../models/Session.js";
import Venue from "../models/Venue.js";
import Sponsor from "../models/Sponsor.js";
import Incident from "../models/Incident.js";

import { askEventIntelligenceAI } from "../ai/eventIntelligence.js";

export const eventIntelligenceChat = async (req, res) => {
  try {
    const { message, eventId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 1. EVENT DATA
     * ---------------------------------------------------------
     */

    let eventQuery = {};

    if (eventId) {
      eventQuery._id = eventId;
    }

    const events = await Event.find(eventQuery)
      .select("title description category capacity startDate endDate")
      .lean();

    /*
     * ---------------------------------------------------------
     * 2. REGISTRATION DATA
     * ---------------------------------------------------------
     */

    let registrationQuery = {};

    if (eventId) {
      registrationQuery.eventId = eventId;
    }

    const registrations = await Registration.find(registrationQuery)
      .select("eventId status createdAt")
      .lean();

    const registrationSummary = {
      total: registrations.length,
      confirmed: registrations.filter(
        (r) => r.status?.toLowerCase() === "confirmed"
      ).length,
      cancelled: registrations.filter(
        (r) => r.status?.toLowerCase() === "cancelled"
      ).length,
      pending: registrations.filter(
        (r) => r.status?.toLowerCase() === "pending"
      ).length,
    };

    /*
     * ---------------------------------------------------------
     * 3. SESSION DATA
     * ---------------------------------------------------------
     */

    const sessions = await Session.find({})
      .select(
        "title description sessionType topic startTime endTime expectedAttendance actualAttendance venueId speakerId status"
      )
      .lean();

    /*
     * ---------------------------------------------------------
     * 4. VENUE DATA
     * ---------------------------------------------------------
     */

    const venues = await Venue.find({})
      .select(
        "name location capacity venueType facilities availability status"
      )
      .lean();

    /*
     * ---------------------------------------------------------
     * 5. SPONSOR DATA
     * ---------------------------------------------------------
     */

    const sponsors = await Sponsor.find({}).lean();

    /*
     * ---------------------------------------------------------
     * 6. INCIDENT DATA
     * ---------------------------------------------------------
     */

    const incidents = await Incident.find({})
      .select(
        "title description category severity priority affectedArea responsibleTeam recommendedAction status resolutionNotes createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    /*
     * ---------------------------------------------------------
     * 7. SESSION SUMMARY
     * ---------------------------------------------------------
     */

    const sessionSummary = {
      total: sessions.length,
      completed: sessions.filter(
        (s) => s.status?.toLowerCase() === "completed"
      ).length,
      scheduled: sessions.filter(
        (s) => s.status?.toLowerCase() === "scheduled"
      ).length,
      cancelled: sessions.filter(
        (s) => s.status?.toLowerCase() === "cancelled"
      ).length,
    };

    /*
     * ---------------------------------------------------------
     * 8. INCIDENT SUMMARY
     * ---------------------------------------------------------
     */

    const incidentSummary = {
      total: incidents.length,

      open: incidents.filter(
        (i) => i.status?.toLowerCase() !== "resolved"
      ).length,

      resolved: incidents.filter(
        (i) => i.status?.toLowerCase() === "resolved"
      ).length,

      critical: incidents.filter(
        (i) => i.severity?.toLowerCase() === "critical"
      ).length,

      highPriority: incidents.filter(
        (i) => i.priority?.toLowerCase() === "high"
      ).length,
    };

    /*
     * ---------------------------------------------------------
     * 9. SPONSOR SUMMARY
     * ---------------------------------------------------------
     */

    const sponsorSummary = {
      total: sponsors.length,

      pendingPayments: sponsors.filter(
        (s) => Number(s.pendingPayment || 0) > 0
      ).length,

      pendingDeliverables: sponsors.filter((s) =>
        Array.isArray(s.deliverables)
          ? s.deliverables.some(
              (d) => d.status?.toLowerCase() === "pending"
            )
          : false
      ).length,
    };

    /*
     * ---------------------------------------------------------
     * 10. INTELLIGENCE DATA
     * ---------------------------------------------------------
     */

    const intelligenceData = {
      events,
      registrationSummary,
      sessionSummary,
      sessions,
      venues,
      sponsorSummary,
      sponsors,
      incidentSummary,
      incidents,
    };

    /*
     * ---------------------------------------------------------
     * 11. GEMINI PROMPT
     * ---------------------------------------------------------
     */

    const prompt = `
You are the Event Intelligence Engine of an AI-powered Event Management System.

Your job is to analyze the current event-management data and provide
clear operational intelligence to an event organizer.

Organizer Question:
"${message.trim()}"

Current Event Data:
${JSON.stringify(intelligenceData, null, 2)}

Analyze the available data and answer the organizer's question.

You can provide intelligence about:

- Overall event status
- Registrations and attendance
- Sessions
- Venues
- Speakers
- Sponsors
- Incidents
- Critical operational problems
- Pending work
- Performance
- Risks
- Immediate actions
- Operational recommendations

Rules:

1. Use ONLY the information provided in the event data.
2. Never invent events, incidents, sponsors, sessions, venues or statistics.
3. If information is unavailable, clearly say that it is unavailable.
4. Prioritize critical and high-priority incidents.
5. Identify operational risks when supported by the data.
6. Give practical recommendations based on the available data.
7. Keep the response concise and easy for an event organizer to understand.
8. Use clean Markdown.
9. Use headings and bullet points where useful.
10. Highlight important numbers and critical issues.
11. Do not expose internal database fields unnecessarily.
12. Do not mention that you are an AI model.

Return only the final organizer-friendly response.
`;

    const response = await askEventIntelligenceAI(prompt);

    /*
     * ---------------------------------------------------------
     * 12. RETURN RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,
      message: response,
      insights: {
        events,
        registrationSummary,
        sessionSummary,
        sponsorSummary,
        incidentSummary,
      },
    });
  } catch (error) {
    console.error("Event Intelligence Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate event intelligence.",
      error: error.message,
    });
  }
};