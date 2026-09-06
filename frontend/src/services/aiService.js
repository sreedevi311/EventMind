import api from "../api/api";

export const getAIInsights = (id)=>
    api.get(`/analytics/ai-insights/${id}`);