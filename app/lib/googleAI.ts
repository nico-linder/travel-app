import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const googleAIModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  },
});

export const chatWithAI = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  systemPrompt?: string
) => {
  if (!API_KEY) {
    throw new Error("Google AI API Key not found. Please add EXPO_PUBLIC_GOOGLE_AI_KEY to your .env file.");
  }

  const chat = googleAIModel.startChat({
    history,
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemPrompt || "You are an expert travel planning assistant for the 'Travel Together' app. Your goal is to help users plan itineraries, discover hidden gems, and estimate travel costs. Be concise, professional, and helpful. Use markdown for better readability. Focus on providing actionable travel advice." }],
    },
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};
