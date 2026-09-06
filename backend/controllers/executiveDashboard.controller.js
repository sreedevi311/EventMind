import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Session from "../models/Session.js";
import Sponsor from "../models/Sponsor.js";
import Incident from "../models/Incident.js";

export const getExecutiveDashboard = async (req, res) => {
  try {
    const { eventId } = req.query;

    /*
     * ---------------------------------------------------------
     * EVENT
     * ---------------------------------------------------------
     */

    let eventQuery = {};

    if (eventId) {
      eventQuery._id = eventId;
    }

    const events = await Event.find(eventQuery)
      .select("title capacity startDate endDate")
      .lean();

    /*
     * ---------------------------------------------------------
     * REGISTRATIONS
     * ---------------------------------------------------------
     */

    let registrationQuery = {};

    if (eventId) {
      registrationQuery.eventId = eventId;
    }

    const registrations = await Registration.find(registrationQuery)
      .select("eventId status createdAt")
      .lean();

    const totalRegistrations = registrations.length;

    const confirmedRegistrations = registrations.filter(
      (r) => r.status?.toLowerCase() === "confirmed"
    ).length;

    const cancelledRegistrations = registrations.filter(
      (r) => r.status?.toLowerCase() === "cancelled"
    ).length;

    /*
     * ---------------------------------------------------------
     * SESSIONS
     * ---------------------------------------------------------
     */

    const sessions = await Session.find({})
      .select(
        "title expectedAttendance actualAttendance status startTime endTime"
      )
      .lean();

    const totalExpectedAttendance = sessions.reduce(
      (sum, session) => sum + Number(session.expectedAttendance || 0),
      0
    );

    const totalActualAttendance = sessions.reduce(
      (sum, session) => sum + Number(session.actualAttendance || 0),
      0
    );

    /*
     * ---------------------------------------------------------
     * ATTENDANCE RATE
     * ---------------------------------------------------------
     */

    let attendanceRate = 0;

    if (totalExpectedAttendance > 0) {
      attendanceRate = Math.round(
        (totalActualAttendance / totalExpectedAttendance) * 100
      );
    }

    /*
     * ---------------------------------------------------------
     * SPONSORS
     * ---------------------------------------------------------
     */

    const sponsors = await Sponsor.find({}).lean();

    const totalSponsors = sponsors.length;

    /*
     * Sponsor ROI
     *
     * ROI =
     * (Generated Value - Investment) / Investment × 100
     *
     * We only calculate it when the required values exist.
     */

    let sponsorInvestment = 0;
    let sponsorValue = 0;

    sponsors.forEach((sponsor) => {
      const investment = Number(
        sponsor.totalAmount ??
          sponsor.total ??
          sponsor.amount ??
          0
      );

      const leads = Number(sponsor.leads || 0);
      const interactions = Number(
        sponsor.attendeeInteractions || 0
      );

      sponsorInvestment += investment;

      /*
       * Use available sponsor engagement value.
       * Do not invent a monetary conversion for leads.
       */
      sponsorValue += leads + interactions;
    });

    let sponsorROI = 0;

    if (sponsorInvestment > 0) {
      /*
       * ROI cannot be meaningfully expressed as a percentage
       * from engagement counts and monetary investment alone.
       *
       * Therefore keep it unavailable unless the database
       * contains an actual generatedValue field.
       */
      const hasGeneratedValue = sponsors.some(
        (sponsor) =>
          sponsor.generatedValue !== undefined ||
          sponsor.revenueGenerated !== undefined
      );

      if (hasGeneratedValue) {
        let generatedValue = 0;

        sponsors.forEach((sponsor) => {
          generatedValue += Number(
            sponsor.generatedValue ??
              sponsor.revenueGenerated ??
              0
          );
        });

        if (sponsorInvestment > 0) {
          sponsorROI = Math.round(
            ((generatedValue - sponsorInvestment) /
              sponsorInvestment) *
              100
          );
        }
      }
    }

    /*
     * ---------------------------------------------------------
     * INCIDENTS
     * ---------------------------------------------------------
     */

    const incidents = await Incident.find({})
      .select(
        "title severity priority status category responsibleTeam createdAt"
      )
      .lean();

    const openIncidents = incidents.filter(
      (incident) =>
        incident.status?.toLowerCase() !== "resolved"
    );

    const criticalIncidents = incidents.filter(
      (incident) =>
        incident.severity?.toLowerCase() === "critical"
    );

    /*
     * ---------------------------------------------------------
     * EVENT HEALTH
     * ---------------------------------------------------------
     */

    let eventHealth = "Good";

    if (criticalIncidents.length > 0) {
      eventHealth = "Critical";
    } else if (openIncidents.length >= 5) {
      eventHealth = "Needs Attention";
    } else if (attendanceRate < 60) {
      eventHealth = "Needs Attention";
    }

    /*
     * ---------------------------------------------------------
     * EVENT STATUS
     * ---------------------------------------------------------
     */

    let eventStatus = "On Track";

    if (criticalIncidents.length > 0) {
      eventStatus = "Requires Immediate Attention";
    } else if (
      openIncidents.length > 0 ||
      attendanceRate < 70
    ) {
      eventStatus = "Needs Attention";
    }

    /*
     * ---------------------------------------------------------
     * REGISTRATION TREND
     * ---------------------------------------------------------
     */

    const registrationTrend = {};

    registrations.forEach((registration) => {
      if (!registration.createdAt) return;

      const date = new Date(registration.createdAt)
        .toISOString()
        .split("T")[0];

      registrationTrend[date] =
        (registrationTrend[date] || 0) + 1;
    });

    const registrationTrendData = Object.entries(
      registrationTrend
    )
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );

    /*
     * ---------------------------------------------------------
     * RISKS / ALERTS
     * ---------------------------------------------------------
     */

    const risks = [];

    if (criticalIncidents.length > 0) {
      risks.push({
        type: "critical",
        message: `${criticalIncidents.length} critical incident${
          criticalIncidents.length > 1 ? "s" : ""
        } require immediate attention.`,
      });
    }

    if (openIncidents.length > 0) {
      risks.push({
        type: "warning",
        message: `${openIncidents.length} incident${
          openIncidents.length > 1 ? "s are" : " is"
        } currently unresolved.`,
      });
    }

    if (attendanceRate < 70) {
      risks.push({
        type: "warning",
        message: `Attendance rate is ${attendanceRate}%, which is below the expected level.`,
      });
    }

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      event: events[0] || null,

      kpis: {
        eventHealth,
        eventStatus,

        registrations: totalRegistrations,

        confirmedRegistrations,

        cancelledRegistrations,

        checkIns: totalActualAttendance,

        attendanceRate,

        sponsors: totalSponsors,

        openIncidents: openIncidents.length,

        criticalIncidents: criticalIncidents.length,

        sponsorROI,
      },

      trends: {
        registrations: registrationTrendData,
      },

      risks,

      sessions: {
        total: sessions.length,
        expectedAttendance: totalExpectedAttendance,
        actualAttendance: totalActualAttendance,
      },
    });
  } catch (error) {
    console.error(
      "Executive Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load executive dashboard.",
      error: error.message,
    });
  }
};