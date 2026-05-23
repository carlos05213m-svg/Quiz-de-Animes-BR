import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client on the server
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint 1: Recommendations
app.post("/api/recommendations", async (req, res) => {
  const { query } = req.body;
  try {
    let prompt = "Sugira 4 animes populares para um quiz, retornando apenas os nomes separados por vírgula, sem explicações.";
    if (query) {
      prompt = `Sugira 4 animes parecidos com "${query}" para um quiz, retornando apenas os nomes separados por vírgula, sem explicações.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const list = text.split(',').map(s => s.trim()).filter(Boolean);
    res.json({ recommendations: list });
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    // Fallback recommendation list in case of API failure
    const fallback = query 
      ? [`${query} Shippuden`, `${query} Movie`, `${query} Alternative`, 'Hunter x Hunter']
      : ['Hunter x Hunter', 'Jujutsu Kaisen', 'Attack on Titan', 'Death Note'];
    res.json({ recommendations: fallback });
  }
});

// Endpoint 2: Generate Quiz
app.post("/api/generate-quiz", async (req, res) => {
  const { animeName } = req.body;
  if (!animeName) {
    return res.status(400).json({ error: "animeName is required" });
  }

  try {
    const prompt = `Gere um quiz sobre o anime "${animeName}" com exatamente 10 perguntas. 
    Retorne apenas um array JSON puro, sem markdown, seguindo esta estrutura:
    [
      {
        "id": "q1",
        "text": "Pergunta aqui?",
        "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
        "correctAnswer": 0
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER }
            },
            required: ["id", "text", "options", "correctAnswer"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const jsonContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const dynamicQuestions = JSON.parse(jsonContent);
    res.json({ questions: dynamicQuestions });
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Endpoint 3: Generate Image (Unsplash suggestion proxy)
app.post("/api/generate-image", async (req, res) => {
  const { context, type } = req.body;
  try {
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    res.json({ url: data.url });
  } catch (error) {
    console.error("Error generating image from Gemini:", error);
    let fallback = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80";
    if (type === 'profile') {
      fallback = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80";
    }
    res.json({ url: fallback });
  }
});

// Vite middleware for development vs static for production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
