import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import registrationPrompt from "../prompts/registrationPrompt.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askAI = async (instruction) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `${registrationPrompt}

Backend Instruction:
${instruction}`,
    });

    return response.text.trim();

  } catch (error) {

    console.log(error);

    return "Sorry, something went wrong.";

  }
};