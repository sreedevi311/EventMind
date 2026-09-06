import api from "../api/api";

export const getEvents = () =>
    api.get("/events");