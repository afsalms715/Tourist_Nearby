import { GoogleGenAI } from '@google/genai';

const API_KEY = "AIzaSyAkZOxf3iermbJeIYZ-sSiEnNCvoq87tE4";

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a short travel plan using Gemini for a specific location.
 * @param {object} place Place metadata (name, category, address)
 * @returns {Promise<string>} Markdown text representing the travel plan
 */
export async function generateTravelPlan(place) {
  const prompt = `Create a short travel exploration plan for tourists visiting:

Place Name: ${place.name}
Category: ${place.category}
Location: ${place.address || 'Unknown'}

Include:
- Best time to visit
- Suggested activities
- Estimated visit duration
Keep it highly engaging, well formatted with bullet points, and strictly under 120 words.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error('Could not generate travel plan at this time.');
  }
}
