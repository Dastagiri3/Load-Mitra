import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. Gemini AI Route Optimizer and Estimator
app.post("/api/gemini/optimize-route", async (req, res) => {
  try {
    const { origin, destination, truckType, weight, material } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    const prompt = `You are an expert logistics coordinator and route planner in India. 
Analyze the freight route from "${origin}" to "${destination}" for a "${truckType || 'Open Body'}" truck carrying "${weight || 10} tons" of "${material || 'General Cargo'}". 
Provide:
1. Recommended major highways (e.g., NH48, Golden Quadrilateral)
2. Estimated practical distance (in Kilometers) and real transport duration (in hours) incorporating Indian highway realities (night driving, checkpoint delays)
3. Recommended freight price estimate range in INR per ton and total fare in INR (no commission logistics)
4. List of major logistics terminal stopover cities along the route
5. Estimate of the number of toll plazas
6. Specific safety/handling instructions for the cargo and driver tips (monsoon care, ghat regions, security).
Return the result strictly according to the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedFreightRateRange: { 
              type: Type.STRING, 
              description: "E.g., '₹2,100 - ₹2,400 per Ton' or total '₹22,000 - ₹25,000'" 
            },
            totalEstimatedFareINR: {
              type: Type.NUMBER,
              description: "Average total estimated freight budget in INR"
            },
            estimatedDistanceKm: { type: Type.NUMBER },
            estimatedDurationHours: { type: Type.NUMBER },
            primaryHighway: { type: Type.STRING, description: "E.g., NH48 via Golden Quadrilateral" },
            majorStops: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-4 major cities/hubs along this route where drivers typically rest" 
            },
            tollPlazasCount: { type: Type.NUMBER },
            safetyTips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Driver safety recommendations, weather warnings, highway checkpoints tips" 
            },
            optimizedSummary: { 
              type: Type.STRING, 
              description: "A professional logistician's brief advice summary for this specific transport" 
            }
          },
          required: ["recommendedFreightRateRange", "estimatedDistanceKm", "estimatedDurationHours", "primaryHighway", "majorStops", "tollPlazasCount", "safetyTips", "optimizedSummary"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("No response text from Gemini");
    }

    const parsedData = JSON.parse(dataText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in optimize-route:", error);
    res.status(500).json({ error: error.message || "Failed to analyze route" });
  }
});

// 2. Gemini AI Load Description Beautifier
app.post("/api/gemini/generate-desc", async (req, res) => {
  try {
    const { origin, destination, material, weight, truckType, instructions } = req.body;
    
    if (!material || !weight) {
      return res.status(400).json({ error: "Material type and weight are required" });
    }

    const prompt = `Generate a highly attractive, professional logistics load posting listing in English & transliterated Hinglish. 
This is for truck owners in India to bid on.
Details:
- Material: ${material}
- Weight: ${weight} Tons
- Route: ${origin || 'Anywhere'} to ${destination || 'Anywhere'}
- Truck Type: ${truckType || 'Flexible'}
- Additional terms/rules: ${instructions || 'Direct loading, fast payment'}

Create a polished, eye-catching Title, clean Description, List of Key Highlights/Requirements (like 'Immediate loading required', 'Aadhaar validated transporter preferred', 'No broker commission').
Return strictly in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Professional, catchy listing title" },
            formattedDescription: { type: Type.STRING, description: "Clean description including dimensions or loading guidelines" },
            keyHighlights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Bullet points for why truck owners should choose this load" 
            },
            suggestedStatusLabel: { type: Type.STRING, description: "E.g., 'URGENT', 'READY_TO_PAY', 'FLEXIBLE_BUDGET'" }
          },
          required: ["title", "formattedDescription", "keyHighlights", "suggestedStatusLabel"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("No response text from Gemini");
    }

    const parsedData = JSON.parse(dataText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in generate-desc:", error);
    res.status(500).json({ error: error.message || "Failed to generate load listing text" });
  }
});

// 3. Indian Logistics Freight Market Insights
app.post("/api/gemini/market-insight", async (req, res) => {
  try {
    const { region } = req.body;
    
    const prompt = `Give me a short Indian logistics freight market analysis report for the region/state of "${region || 'All India National'}".
Discuss:
1. Average freight demand trend (Rising, High, Stable, Low)
2. Impact of seasonal changes (crop harvesting, monsoon, major festivals like Diwali) on truck availabilities and dispatch rates
3. Top outbound corridors and popular cargo items
4. Standard professional transport tip or recommendation.
Return the result strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketStatus: { type: Type.STRING, description: "E.g. High Demand, Stable, Monsoon Surge" },
            regionalIndexScore: { type: Type.NUMBER, description: "A relative score out of 100 for market traffic activity" },
            dieselPriceStatus: { type: Type.STRING, description: "E.g. 'Stable around ₹90-95 depending on state levies'" },
            seasonalImpact: { type: Type.STRING, description: "Describe monsoon or agricultural harvest challenges" },
            busyCorridors: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketAdvice: { type: Type.STRING, description: "Direct advice to truckers or shippers regarding negotiation" }
          },
          required: ["marketStatus", "regionalIndexScore", "dieselPriceStatus", "seasonalImpact", "busyCorridors", "marketAdvice"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("No response text from Gemini");
    }

    const parsed = JSON.parse(dataText.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in market-insight:", error);
    res.status(500).json({ error: error.message || "Failed to generate freight insights" });
  }
});

// Integrate Vite Middleware
async function startServer() {
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

startServer();
