import api from "../api/api";

export const sendMessage = (sessionId, message) => {
    return api.post("/ai/register", {
        sessionId,
        message,
    });
};