import api from "../api/api";

export const chatWithSponsorshipAgent = (data) => {
  return api.post("/sponsorship-agent/chat", data);
};