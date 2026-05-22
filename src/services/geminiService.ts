import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIGeneratedImage(context: string, type: 'profile' | 'cover' | 'background'): Promise<string> {
  const prompt = `
    You are an AI assistant for an Anime Quiz app. 
    The user needs a high-quality, representative image for: ${type}.
    Context: ${context}
    
    Based on this context, find a highly relevant image from Unsplash.
    Return a JSON object with the 'url' of the image.
    The URL should be a direct link to a high-quality image on images.unsplash.com or a valid professional anime art host.
    
    If it's an anime, try to find a professional wallpaper or character art URL.
    If it's a person's name for a profile, find a cool anime-style avatar or a representative nature/abstract image.
    
    Example output format:
    {
      "url": "https://images.unsplash.com/photo-..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING }
          },
          required: ["url"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.url;
  } catch (error) {
    console.error("Error generating AI image:", error);
    // Fallback images
    if (type === 'profile') return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80";
  }
}
