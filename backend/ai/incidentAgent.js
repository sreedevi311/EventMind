import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askIncidentAI = async (prompt) => {
  try {
    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

    return (
      response.text ||
      "I couldn't analyze the incident."
    );
  } catch (error) {
    console.error(
      "Incident AI Error:",
      error
    );

    throw error;
  }
};