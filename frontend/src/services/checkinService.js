import api from "../api/api";

// Check-In
export const checkIn = (data) => {
    return api.post("/checkin", data);
};

// Get all checked-in attendees
export const getAllCheckIns = () => {
    return api.get("/checkin");
};

// Get check-in status of a registration
export const getCheckInStatus = (registrationId) => {
    return api.get(`/checkin/${registrationId}`);
};