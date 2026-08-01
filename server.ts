import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString(), platform: "F1 Race Strategy Intelligence" });
});

// Gemini AI Strategy Assistant Endpoint
app.post("/api/gemini/strategy", async (req, res) => {
  try {
    const { prompt, raceState } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are a Senior Principal F1 Race Strategy Director and Chief Telemetry Engineer for a leading Formula 1 team.
Provide hyper-precise, data-driven, tactical strategy advice. Focus on:
1. Tyre Degradation curves and thermal compound management (C1-C5 Pirelli range).
2. Undercut and Overcut deltas, pit stop windows, and gap to traffic upon re-entry.
3. Safety Car / VSC probability, rain crossover points (Slick -> Inter -> Wet), and track temperature evolution.
4. Direct, crisp radio-style tactical recommendations (e.g., "BOX THIS LAP FOR HARDS", "EXTEND STINT 3 LAPS TO CLEAR TRAFFIC").
Format your output with clear headings, bold tactical callouts, bullet points, and quantitative lap delta estimations. Keep it professional and implementation-ready.`;

    const userMessage = `Race Context:
- Track: ${raceState?.track || "Silverstone Circuit"}
- Current Lap: ${raceState?.currentLap || 24} / ${raceState?.totalLaps || 52}
- Weather / Track Temp: ${raceState?.weather || "Dry, 32°C Track Temp"}
- Leader: ${raceState?.leader || "VER (Red Bull)"}
- Focus Driver: ${raceState?.focusDriver || "HAM (Ferrari)"} (P2, +2.4s to VER)
- Current Tyre Stint: ${raceState?.tyreCompound || "Medium (C3)"}, Age: ${raceState?.tyreAge || 18} laps, Deg: ${raceState?.tyreDeg || "24%"}
- Gap to Traffic Behind (P5-P7): ${raceState?.gapToTraffic || "+21.8s"} (Pit loss: 20.5s)
- User Strategy Query / Situation: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      analysis: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini Strategy API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI strategy response",
      fallbackAdvice: "CRITICAL ALERT: Maintain current pace. Gap to traffic is +21.8s. Pit window opens on Lap 26 for Hard tyres (C2). Monitor rear-left thermal degradation.",
    });
  }
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`F1 Strategy Intelligence Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
