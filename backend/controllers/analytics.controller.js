import Registration from "../models/Registration.js";
import Session from "../models/Session.js";

// ==========================================
// OVERVIEW
// GET /api/analytics/overview/:eventId
// ==========================================
export const getOverview = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId });

    const totalRegistrations = registrations.length;

    const registered = registrations.filter(
      r => r.registrationStatus === "REGISTERED"
    ).length;

    const checkedIn = registrations.filter(
      r => r.registrationStatus === "CHECKED_IN"
    ).length;

    const cancelled = registrations.filter(
      r => r.registrationStatus === "CANCELLED"
    ).length;

    const attendanceRate =
      totalRegistrations === 0
        ? 0
        : Number(((checkedIn / totalRegistrations) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        registered,
        checkedIn,
        cancelled,
        attendanceRate,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// DEMOGRAPHICS
// GET /api/analytics/demographics/:eventId
// ==========================================
export const getDemographics = async (req, res) => {
  try {

    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId });

    const demographics = {
      department: {},
      year: {},
      college: {},
    };

    registrations.forEach((registration) => {

      registration.responses.forEach((response) => {

        const key = response.key.toLowerCase();
        const value = String(response.value);

        if (key === "department") {
          demographics.department[value] =
            (demographics.department[value] || 0) + 1;
        }

        if (key === "year") {
          demographics.year[value] =
            (demographics.year[value] || 0) + 1;
        }

        if (key === "college") {
          demographics.college[value] =
            (demographics.college[value] || 0) + 1;
        }

      });

    });

    return res.status(200).json({
      success: true,
      data: demographics,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// CHECK-IN ANALYTICS
// GET /api/analytics/checkins/:eventId
// ==========================================
export const getCheckInAnalytics = async (req, res) => {
  try {

    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId });

    const registered = registrations.length;

    const checkedIn = registrations.filter(
      r => r.registrationStatus === "CHECKED_IN"
    ).length;

    const notCheckedIn = registered - checkedIn;

    const attendanceRate =
      registered === 0
        ? 0
        : Number(((checkedIn / registered) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        registered,
        checkedIn,
        notCheckedIn,
        attendanceRate,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// REGISTRATION TRENDS
// GET /api/analytics/trends/:eventId
// ==========================================
export const getRegistrationTrends = async (req, res) => {
  try {

    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId });

    const trends = {};

    registrations.forEach((registration) => {

      const date = registration.createdAt.toISOString().split("T")[0];

      trends[date] = (trends[date] || 0) + 1;

    });

    const data = Object.entries(trends).map(([date, registrations]) => ({
      date,
      registrations,
    }));

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ==========================================
// SESSION ANALYTICS
// GET /api/analytics/session/:eventId
// ==========================================

export const getSessionAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "eventId is required.",
      });
    }

    const sessions = await Session.find({
      eventId,
    })
      .populate("speakerId", "name organization")
      .populate("venueId", "name location")
      .sort({ startTime: 1 })
      .lean();

    // ==========================================
    // BASIC COUNTS
    // ==========================================

    const totalSessions = sessions.length;

    const completedSessions = sessions.filter(
      (session) => session.status === "Completed"
    ).length;

    const ongoingSessions = sessions.filter(
      (session) => session.status === "Ongoing"
    ).length;

    const scheduledSessions = sessions.filter(
      (session) => session.status === "Scheduled"
    ).length;

    const cancelledSessions = sessions.filter(
      (session) => session.status === "Cancelled"
    ).length;

    // ==========================================
    // ATTENDANCE
    // ==========================================

    const totalExpectedAttendance = sessions.reduce(
      (sum, session) =>
        sum + (session.expectedAttendance || 0),
      0
    );

    const totalActualAttendance = sessions.reduce(
      (sum, session) =>
        sum + (session.actualAttendance || 0),
      0
    );

    const attendanceRate =
      totalExpectedAttendance > 0
        ? Math.round(
            (totalActualAttendance /
              totalExpectedAttendance) *
              100
          )
        : 0;

    // ==========================================
    // RATINGS
    // ==========================================

    const ratedSessions = sessions.filter(
      (session) =>
        session.feedbackCount > 0
    );

    const averageRating =
      ratedSessions.length > 0
        ? Number(
            (
              ratedSessions.reduce(
                (sum, session) =>
                  sum +
                  (session.averageRating || 0),
                0
              ) / ratedSessions.length
            ).toFixed(2)
          )
        : 0;

    // ==========================================
    // SESSION TYPE DISTRIBUTION
    // ==========================================

    const sessionTypeMap = {};

    sessions.forEach((session) => {
      const type =
        session.sessionType || "Other";

      sessionTypeMap[type] =
        (sessionTypeMap[type] || 0) + 1;
    });

    const sessionTypes = Object.entries(
      sessionTypeMap
    ).map(([type, count]) => ({
      type,
      count,
    }));

    // ==========================================
    // TOP SESSIONS BY ATTENDANCE
    // ==========================================

    const topSessions = [...sessions]
      .sort(
        (a, b) =>
          (b.actualAttendance || 0) -
          (a.actualAttendance || 0)
      )
      .slice(0, 5)
      .map((session) => ({
        id: session._id,
        title: session.title,
        sessionType: session.sessionType,
        expectedAttendance:
          session.expectedAttendance || 0,
        actualAttendance:
          session.actualAttendance || 0,
        averageRating:
          session.averageRating || 0,
        speaker:
          session.speakerId?.name ||
          "Not assigned",
        venue:
          session.venueId?.name ||
          "Not assigned",
        status: session.status,
      }));

    // ==========================================
    // SESSION DETAILS
    // ==========================================

    const sessionDetails = sessions.map(
      (session) => ({
        id: session._id,
        title: session.title,
        sessionType:
          session.sessionType,
        topic: session.topic,
        startTime:
          session.startTime,
        endTime:
          session.endTime,
        expectedAttendance:
          session.expectedAttendance || 0,
        actualAttendance:
          session.actualAttendance || 0,
        averageRating:
          session.averageRating || 0,
        feedbackCount:
          session.feedbackCount || 0,
        status: session.status,
        speaker:
          session.speakerId?.name ||
          "Not assigned",
        venue:
          session.venueId?.name ||
          "Not assigned",
      })
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        ongoingSessions,
        scheduledSessions,
        cancelledSessions,

        totalExpectedAttendance,
        totalActualAttendance,
        attendanceRate,

        averageRating,

        sessionTypes,

        topSessions,

        sessionDetails,
      },
    });
  } catch (error) {
    console.error(
      "Session Analytics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};