import Registration from "../models/Registration.js";
import { generateAnalyticsInsights } from "../ai/analyticsAgent.js";

export const getAIInsights = async (req, res) => {
  try {

    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId });

    const overview = {
      totalRegistrations: registrations.length,
      registered: 0,
      checkedIn: 0,
      cancelled: 0,
      attendanceRate: 0,
    };

    const demographics = {
      department: {},
      year: {},
      college: {},
    };

    const trends = {};

    registrations.forEach((registration) => {

      if (registration.registrationStatus === "REGISTERED")
        overview.registered++;

      if (registration.registrationStatus === "CHECKED_IN")
        overview.checkedIn++;

      if (registration.registrationStatus === "CANCELLED")
        overview.cancelled++;

      registration.responses.forEach((response) => {

        const key = response.key.toLowerCase();
        const value = String(response.value);

        if (key === "department")
          demographics.department[value] =
            (demographics.department[value] || 0) + 1;

        if (key === "year")
          demographics.year[value] =
            (demographics.year[value] || 0) + 1;

        if (key === "college")
          demographics.college[value] =
            (demographics.college[value] || 0) + 1;

      });

      const date = registration.createdAt
        .toISOString()
        .split("T")[0];

      trends[date] = (trends[date] || 0) + 1;

    });

    overview.attendanceRate =
      overview.totalRegistrations === 0
        ? 0
        : Number(
            (
              (overview.checkedIn /
                overview.totalRegistrations) *
              100
            ).toFixed(2)
          );

    const analyticsData = {
      overview,
      demographics,
      trends,
    };

    const aiInsights = await generateAnalyticsInsights(
      analyticsData
    );

    return res.status(200).json({
      success: true,
      data: aiInsights,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};