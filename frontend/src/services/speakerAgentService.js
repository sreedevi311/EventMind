import api from "../api/api";

// ==========================================
// CHAT WITH SPEAKER AGENT
// ==========================================

export const chatWithSpeakerAgent = (data) => {
  return api.post("/speaker-agent/chat", data);
};

// ==========================================
// ASSIGN SPEAKER
// ==========================================

export const assignSpeaker = (speakerId, data) => {
  return api.post(
    `/speaker-agent/${speakerId}/assign`,
    data
  );
};