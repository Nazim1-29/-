import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function smartSearch(query: string, language: 'ar' | 'en') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional navigation assistant for Iraq. 
      The user is searching for: "${query}" in ${language === 'ar' ? 'Arabic' : 'English'}.
      
      Find the most likely point of interest (POI), landmark, or address in Iraq matching this query.
      Always include approximate latitude and longitude coordinates based on your knowledge of Iraqi geography.
      
      Respond STRICTLY in JSON format with the following keys:
      {
        "name": "Exact name of the location",
        "description": "Short friendly description (in ${language === 'ar' ? 'Arabic' : 'English'})",
        "lat": number (e.g. 33.3152),
        "lng": number (e.g. 44.3661),
        "type": "landmark" | "restaurant" | "gas_station" | "mall" | "checkpoint"
      }

      Return ONLY the raw JSON object.`,
    });

    const text = response.text;
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error("JSON parsing error", e);
      return { 
        name: query, 
        description: text, 
        lat: null, 
        lng: null, 
        type: "other" 
      };
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}
