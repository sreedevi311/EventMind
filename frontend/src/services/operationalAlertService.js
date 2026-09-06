import api from "../api/api";

export const getOperationalAlerts = () => {
  return api.get("/incidents/alerts");
};