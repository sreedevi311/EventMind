import api from "../api/api";

export const getDashboardStats = () =>
    api.get("/dashboard/stats");

export const getRecentRegistrations = () =>
    api.get("/dashboard/recent");

export const getAIInsights = () =>
    api.get("/dashboard/insights");

export const getExecutiveDashboard = async (eventId) => {
  const response = await api.get(
    "/executive-dashboard",
    {
      params: eventId ? { eventId } : {},
    }
  );

  return response.data;
};