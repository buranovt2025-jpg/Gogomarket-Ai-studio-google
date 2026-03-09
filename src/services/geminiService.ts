import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeListingMedia = async (base64Media: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Media,
                mimeType: mimeType
              }
            },
            {
              text: "Analyze this image or video of a product for sale. Generate a catchy title, a detailed description, a suggested price in USD, and a category. Return the result in JSON format with keys: title, description, suggestedPrice, category."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};
