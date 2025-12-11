import { GoogleGenAI, Content, Part } from "@google/genai";
import { APIO_SYSTEM_PROMPT, ChatMessage } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  currentMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    // Convert internal chat history to Gemini format
    // Filter out 'thinking' messages or system nuances if any
    const formattedHistory: Content[] = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text } as Part],
    }));

    // We use generateContent with systemInstruction to enforce the APIO persona
    const model = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config: {
        systemInstruction: APIO_SYSTEM_PROMPT,
        temperature: 0.3, // As requested: 0.2-0.4 for precision
        maxOutputTokens: 1000,
      }
    });

    return response.text || "Lo siento, hubo un error al procesar tu respuesta en el contexto minero. Intenta de nuevo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error de conexión con el módulo de inteligencia. Verifica tu conexión o intenta más tarde.";
  }
};