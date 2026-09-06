import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askEventIntelligenceAI = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Event Intelligence AI Error:", error);
    throw new Error("Failed to generate event intelligence.");
  }
};