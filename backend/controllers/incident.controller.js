import Incident from "../models/Incident.js";
import { askIncidentAI } from "../ai/incidentAgent.js";

// ==========================================
// REPORT INCIDENT
// POST /api/incidents
// ==========================================

export const createIncident = async (
  req,
  res
) => {
  try {
    const { description, title } =
      req.body;

    if (
      !description ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Incident description is required.",
      });
    }

    // ======================================
    // AI CLASSIFICATION
    // ======================================

    const prompt = `
You are an AI Event Incident Management Agent.

Analyze the following event incident:

"${description}"

${title ? `Title: ${title}` : ""}

Classify the incident.

Return ONLY valid JSON in this exact format:

{
  "category": "",
  "severity": "",
  "priority": "",
  "affectedArea": "",
  "responsibleTeam": "",
  "recommendedAction": ""
}

Allowed categories:

Technical
Registration
Venue
Speaker
Medical
Security
Power
Network
Audio/Video
Crowd
Equipment
VIP
Other

Allowed severity:

Low
Medium
High
Critical

Allowed priority:

Low
Medium
High
Critical

Rules:

- Identify the most appropriate category.
- Critical incidents are incidents that can seriously affect the event or attendee safety.
- Priority should reflect how quickly the incident needs attention.
- Identify the affected area if mentioned.
- Assign a reasonable responsible team.
- Give a practical recommended action.
- Do not invent unnecessary information.
- Return ONLY JSON.
`;

    const aiResponse =
      await askIncidentAI(prompt);

    let analysis;

    try {
      const cleaned =
        aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      analysis = JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Incident AI parsing error:",
        aiResponse
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to analyze incident.",
      });
    }

    // ======================================
    // SAVE INCIDENT
    // ======================================

    const incident =
      await Incident.create({
        title:
          title?.trim() ||
          "Event Incident",

        description:
          description.trim(),

        category:
          analysis.category ||
          "Other",

        severity:
          analysis.severity ||
          "Medium",

        priority:
          analysis.priority ||
          "Medium",

        affectedArea:
          analysis.affectedArea ||
          "",

        responsibleTeam:
          analysis.responsibleTeam ||
          "",

        recommendedAction:
          analysis.recommendedAction ||
          "",

        status: "Reported",
      });

    return res.status(201).json({
      success: true,
      message:
        "Incident reported and analyzed successfully.",
      incident,
    });
  } catch (error) {
    console.error(
      "Create Incident Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create incident.",
    });
  }
};

// ==========================================
// GET ALL INCIDENTS
// GET /api/incidents
// ==========================================

export const getAllIncidents = async (
  req,
  res
) => {
  try {
    const incidents =
      await Incident.find({})
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error(
      "Get Incidents Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch incidents.",
    });
  }
};

// ==========================================
// GET INCIDENT BY ID
// GET /api/incidents/:id
// ==========================================

export const getIncidentById = async (
  req,
  res
) => {
  try {
    const incident =
      await Incident.findById(
        req.params.id
      );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message:
          "Incident not found.",
      });
    }

    return res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch incident.",
    });
  }
};

// ==========================================
// UPDATE INCIDENT STATUS
// PATCH /api/incidents/:id/status
// ==========================================

export const updateIncidentStatus =
  async (req, res) => {
    try {
      const {
        status,
        resolutionNotes,
      } = req.body;

      const allowedStatuses = [
        "Reported",
        "Investigating",
        "In Progress",
        "Resolved",
        "Closed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid incident status.",
        });
      }

      const updateData = {
        status,
      };

      if (resolutionNotes) {
        updateData.resolutionNotes =
          resolutionNotes;
      }

      if (
        status === "Resolved" ||
        status === "Closed"
      ) {
        updateData.resolvedAt =
          new Date();
      }

      const incident =
        await Incident.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!incident) {
        return res.status(404).json({
          success: false,
          message:
            "Incident not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Incident status updated successfully.",
        incident,
      });
    } catch (error) {
      console.error(
        "Update Incident Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update incident.",
      });
    }
  };

// ==========================================
// INCIDENT ANALYTICS
// GET /api/incidents/analytics
// ==========================================

export const getIncidentAnalytics =
  async (req, res) => {
    try {
      const incidents =
        await Incident.find({}).lean();

      const totalIncidents =
        incidents.length;

      const openIncidents =
        incidents.filter(
          (incident) =>
            ![
              "Resolved",
              "Closed",
            ].includes(
              incident.status
            )
        ).length;

      const resolvedIncidents =
        incidents.filter(
          (incident) =>
            [
              "Resolved",
              "Closed",
            ].includes(
              incident.status
            )
        ).length;

      const criticalIncidents =
        incidents.filter(
          (incident) =>
            incident.priority ===
              "Critical" ||
            incident.severity ===
              "Critical"
        ).length;

      const highPriorityIncidents =
        incidents.filter(
          (incident) =>
            incident.priority ===
            "High"
        ).length;

      // ====================================
      // CATEGORY BREAKDOWN
      // ====================================

      const categoryMap = {};

      incidents.forEach(
        (incident) => {
          const category =
            incident.category ||
            "Other";

          categoryMap[category] =
            (categoryMap[category] ||
              0) + 1;
        }
      );

      const categoryBreakdown =
        Object.entries(
          categoryMap
        ).map(
          ([
            category,
            count,
          ]) => ({
            category,
            count,
          })
        );

      // ====================================
      // PRIORITY BREAKDOWN
      // ====================================

      const priorityMap = {};

      incidents.forEach(
        (incident) => {
          const priority =
            incident.priority ||
            "Medium";

          priorityMap[priority] =
            (priorityMap[priority] ||
              0) + 1;
        }
      );

      const priorityBreakdown =
        Object.entries(
          priorityMap
        ).map(
          ([
            priority,
            count,
          ]) => ({
            priority,
            count,
          })
        );

      return res.status(200).json({
        success: true,

        analytics: {
          totalIncidents,
          openIncidents,
          resolvedIncidents,
          criticalIncidents,
          highPriorityIncidents,
          categoryBreakdown,
          priorityBreakdown,
        },
      });
    } catch (error) {
      console.error(
        "Incident Analytics Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate incident analytics.",
      });
    }
  };

// ==========================================
// AI INCIDENT CHAT
// POST /api/incidents/chat
// ==========================================

export const incidentAgentChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const incidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .lean();

    const prompt = `
You are an AI Event Incident Management Agent.

Organizer request:
"${message}"

Current incident records:
${JSON.stringify(incidents, null, 2)}

Answer the organizer's request.

IMPORTANT:
Return ONLY valid JSON in this exact format:

{
  "response": "your concise response to the organizer",
  "incidentIds": []
}

Rules:

- Use only the provided incident records.
- incidentIds must contain ONLY the _id values of incidents that are directly relevant to the user's request.
- If the user asks about unresolved incidents, return only unresolved incident IDs.
- If the user asks about critical incidents, return only critical incident IDs.
- If the user asks about a specific incident, return only that incident ID.
- If the user is reporting a NEW incident, return an empty incidentIds array.
- If no existing incident is relevant, return [].
- Do not invent incident IDs.
- Keep the response concise.
`;

    const aiResponse = await askIncidentAI(prompt);

    let result;

    try {
      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Incident AI parsing error:",
        aiResponse
      );

      return res.status(500).json({
        success: false,
        message: "Unable to process incident request.",
      });
    }

    // Only return incidents relevant to the user's question
    const relevantIds = Array.isArray(result.incidentIds)
      ? result.incidentIds.map(String)
      : [];

    const relevantIncidents = incidents.filter((incident) =>
      relevantIds.includes(String(incident._id))
    );

    return res.status(200).json({
      success: true,
      message: result.response,
      incidents: relevantIncidents,
    });
  } catch (error) {
    console.error(
      "Incident Agent Chat Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to process incident request.",
    });
  }
};

// ==========================================
// OPERATIONAL ALERTS
// GET /api/incidents/alerts
// ==========================================

export const getOperationalAlerts = async (req, res) => {
  try {
    const incidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .lean();

    const alerts = [];

    // ==========================================
    // INCIDENT ALERTS
    // ==========================================

    incidents.forEach((incident) => {
      // Critical incident
      if (
        incident.priority === "Critical" ||
        incident.severity === "Critical"
      ) {
        alerts.push({
          type: "INCIDENT",
          severity: "Critical",
          title: "Critical Incident",
          message: `${incident.title} requires immediate attention.`,
          incidentId: incident._id,
          status: incident.status,
          createdAt: incident.createdAt,
        });

        return;
      }

      // High priority unresolved incident
      if (
        incident.priority === "High" &&
        !["Resolved", "Closed"].includes(
          incident.status
        )
      ) {
        alerts.push({
          type: "INCIDENT",
          severity: "High",
          title: "High Priority Incident",
          message: `${incident.title} is still unresolved.`,
          incidentId: incident._id,
          status: incident.status,
          createdAt: incident.createdAt,
        });
      }
    });

    // ==========================================
    // SPONSOR ALERTS
    // ==========================================

    const Sponsor = (
      await import("../models/Sponsor.js")
    ).default;

    const sponsors = await Sponsor.find({})
      .sort({ createdAt: -1 })
      .lean();

    sponsors.forEach((sponsor) => {
      // Pending payment
      if (
        Number(sponsor.pendingAmount || 0) > 0
      ) {
        alerts.push({
          type: "SPONSOR_PAYMENT",
          severity: "Medium",
          title: "Pending Sponsor Payment",
          message: `${sponsor.name} has ₹${Number(
            sponsor.pendingAmount
          ).toLocaleString("en-IN")} pending.`,
          sponsorId: sponsor._id,
          createdAt: sponsor.updatedAt,
        });
      }

      // Pending deliverables
      const pendingDeliverables =
        (sponsor.deliverables || []).filter(
          (deliverable) =>
            ["Pending", "In Progress"].includes(
              deliverable.status
            )
        );

      if (pendingDeliverables.length > 0) {
        alerts.push({
          type: "SPONSOR_DELIVERABLE",
          severity: "Medium",
          title: "Pending Sponsor Deliverables",
          message: `${sponsor.name} has ${pendingDeliverables.length} pending or incomplete deliverable(s).`,
          sponsorId: sponsor._id,
          deliverables: pendingDeliverables,
          createdAt: sponsor.updatedAt,
        });
      }

      // Branding incomplete
      if (
        sponsor.brandingRequirements?.length > 0 &&
        !sponsor.brandingCompleted
      ) {
        alerts.push({
          type: "SPONSOR_BRANDING",
          severity: "Medium",
          title: "Incomplete Sponsor Branding",
          message: `${sponsor.name} has incomplete branding requirements.`,
          sponsorId: sponsor._id,
          createdAt: sponsor.updatedAt,
        });
      }
    });

    // ==========================================
    // SORT ALERTS
    // ==========================================

    const severityOrder = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    alerts.sort(
      (a, b) =>
        (severityOrder[a.severity] || 5) -
        (severityOrder[b.severity] || 5)
    );

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error(
      "Operational Alerts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate operational alerts.",
    });
  }
};