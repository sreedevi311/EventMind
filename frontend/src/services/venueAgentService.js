import api from "../api/api";

// ==========================================
// VENUE AGENT CHAT
// ==========================================

export const chatWithVenueAgent = (data) => {
  return api.post("/venue-agent/chat", data);
};

// ==========================================
// BOOK VENUE
// ==========================================

export const bookVenue = (venueId, data) => {
  return api.post(`/venues/${venueId}/book`, data);
};