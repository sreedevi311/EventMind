import api from "../api/api";

export const createRegistration = (data) =>
    api.post("/registrations", data);

export const getAllRegistrations = () =>
    api.get("/registrations");