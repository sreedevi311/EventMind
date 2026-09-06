import api from "../api/api";

export const updateIncidentStatus = (
  id,
  data
) =>
  api.patch(
    `/incidents/${id}/status`,
    data
  );

export const getAllIncidents = () =>
  api.get("/incidents");

export const chatWithIncidentAgent = (data) =>
  api.post("/incidents/chat", data);