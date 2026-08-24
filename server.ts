import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Enhance Prompt / Video Direction
app.post("/api/gemini/enhance-prompt", async (req, res) => {
  try {
    const { prompt, style, cameraMotion, duration } = req.body;
    const ai = getAI();

    const systemInstruction = `Você é um diretor de cinema e especialista em inteligência artificial generativa de vídeo (como Google Veo, Sora, Runway Gen-3).
Sua missão é transformar a ideia simples do usuário em um prompt cinematográfico ultra detalhado para geração de vídeo em alta definição, especificando iluminação, atmosfera, composição, movimento de câmera, texturas e ritmo.
Responda em JSON estruturado com os campos:
- enhancedPrompt: string (prompt principal detalhado)
- cameraDirection: string (descrição do movimento de câmera e lentes)
- lightingAndColor: string (esquema de cores e iluminação)
- soundAtmosphere: string (descrição do áudio ambiente e sonoplastia recomendada)
- suggestedMusicTempo: string (ex: 'épico 90bpm', 'lo-fi relaxante', 'synthwave acelerado')
- visualTags: array de strings (5-8 tags de estilo)`;

    const promptText = `Ideia: "${prompt || "Vídeo épico"}"
Estilo desejado: ${style || "Cinematográfico"}
Movimento de câmera: ${cameraMotion || "Panorâmica suave"}
Duração: ${duration || 5}s`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in enhance-prompt:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao aprimorar prompt" });
  }
});

// 3. Generate Complete Multi-Scene Video Script
app.post("/api/gemini/generate-script", async (req, res) => {
  try {
    const { idea, sceneCount = 3, targetDuration = 15, style = "Cinemático" } = req.body;
    const ai = getAI();

    const systemInstruction = `Você é um diretor e roteirista de vídeos IA de renome mundial.
Crie um roteiro de vídeo completo com exatamente ${sceneCount} cenas sequenciais coerentes para uma duração total de ${targetDuration} segundos.
Para cada cena, forneça:
- id: número (1, 2, ...)
- title: título curto da cena
- duration: duração em segundos (a soma de todas deve ser ${targetDuration})
- visualPrompt: descrição visual rica para renderização/geração do vídeo
- cameraMotion: tipo de movimento (ex: 'slow_pan_right', 'zoom_in', 'drone_flythrough', 'orbit', 'tilt_up', 'static')
- narration: fala/narração para voz IA
- subtitle: texto sobreposto na tela (legenda curta impactante)
- moodColor: cor hexadecimal predominante para a atmosfera visual (ex: '#1a1f3c', '#ff5533', '#0a2218')
- atmosphereEffect: efeito visual (ex: 'particles', 'rain', 'lens_flare', 'cyber_grid', 'dust_motes', 'none')

Retorne JSON no formato:
{
  "title": "Título do Projeto de Vídeo",
  "synopsis": "Breve sinopse do vídeo",
  "scenes": [ ... ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Ideia do vídeo: "${idea}"\nEstilo: ${style}\nNúmero de cenas: ${sceneCount}\nDuração total: ${targetDuration}s`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in generate-script:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar roteiro" });
  }
});

// 4. Generate AI Image / Keyframe for scenes (using Imagen/Flash Image)
app.post("/api/gemini/generate-keyframe", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body;
    const ai = getAI();

    // Map aspect ratio
    const validRatios = ["16:9", "9:16", "1:1", "4:3", "3:4"];
    const selectedRatio = validRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `High cinematic quality, 8k render, masterpiece video still frame: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: selectedRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      res.json({ success: true, imageUrl });
    } else {
      res.status(400).json({ success: false, error: "Nenhuma imagem foi gerada pelo modelo" });
    }
  } catch (error: any) {
    console.error("Error generating keyframe:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar imagem de cena" });
  }
});

// 5. Veo Video Generation (if user has Veo access with key)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", resolution = "720p", startingImage } = req.body;
    const ai = getAI();

    const videoConfig: any = {
      model: "veo-3.1-lite-generate-preview",
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution === "1080p" ? "1080p" : "720p",
        aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
      },
    };

    if (startingImage && typeof startingImage === "string" && startingImage.startsWith("data:")) {
      const match = startingImage.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        videoConfig.image = {
          mimeType: match[1],
          imageBytes: match[2],
        };
      }
    }

    const operation = await ai.models.generateVideos(videoConfig);
    res.json({ success: true, operationName: operation.name });
  } catch (error: any) {
    console.error("Error in generate-video:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao iniciar geração de vídeo Veo" });
  }
});

// 6. Veo Video Status Polling
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: "operationName is required" });
    }
    const ai = getAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ success: true, done: updated.done, response: updated.response });
  } catch (error: any) {
    console.error("Error in video-status:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao consultar status do vídeo" });
  }
});

// 7. Veo Video Download
app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!operationName || !apiKey) {
      return res.status(400).json({ success: false, error: "operationName and API key are required" });
    }
    const ai = getAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ success: false, error: "Video URI not found" });
    }
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });
    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.status(500).json({ success: false, error: "Failed to fetch video stream" });
    }
  } catch (error: any) {
    console.error("Error in video-download:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao baixar vídeo" });
  }
});

// Vite Middleware for SPA serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Video Generator Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
