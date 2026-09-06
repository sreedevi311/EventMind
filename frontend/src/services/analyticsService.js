import api from "../api/api";

export const getOverview = (id) =>
    api.get(`/analytics/overview/${id}`);

export const getDemographics = (id) =>
    api.get(`/analytics/demographics/${id}`);

export const getCheckInAnalytics = (id) =>
    api.get(`/analytics/checkins/${id}`);

export const getRegistrationTrends = (id) =>
    api.get(`/analytics/trends/${id}`);

export const getSessionAnalytics = (eventId) => {
  return api.get(`/analytics/session/${eventId}`);
};