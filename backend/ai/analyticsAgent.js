import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAnalyticsInsights = async (analyticsData) => {
  try {
    const prompt = `
You are an AI Event Analytics Assistant.

Analyze the following event analytics and generate concise insights.

Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Return ONLY JSON in this format:

{
  "summary": "",
  "insights": [
    "",
    "",
    ""
  ],
  "recommendations": [
    "",
    "",
    ""
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return JSON.parse(response.text);

  } catch (error) {
    throw error;
  }
};