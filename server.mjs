import dotenv from "dotenv";
import express from "express";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const envPath = join(ROOT, ".env");
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn("No se encontró .env en:", envPath);
}

const PORT = Number(process.env.PORT) || 5000;

const profile = JSON.parse(
  readFileSync(join(ROOT, "data", "profile.json"), "utf-8")
);

const LANGUAGE_RULE = `CRITICAL — OUTPUT LANGUAGE: You MUST write every response in English only.
Never reply in Spanish, French, or any other language, even if the user writes in another language.
If the user asks in Spanish, still answer in English.`;

const SYSTEM_PROMPT = `You are the virtual assistant for Franco Ángel Jasso Osorio's professional portfolio website (English).

${LANGUAGE_RULE}

You may only discuss Franco, his career, education, skills, experience, and languages.
If asked about anything else, politely explain that you can only help with Franco's professional information.
Be concise, professional, and friendly. Do not invent facts that are not in the profile.

FULL PROFILE (source of truth):
${JSON.stringify(profile, null, 2)}`;

function getApiKey() {
  return (
    process.env.GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY
  );
}

/** PwC GenAI usa API compatible con OpenAI en /v1/chat/completions */
function getOpenAiConfig() {
  const apiKey = getApiKey();
  if (!apiKey) return { error: "Missing GENAI_API_KEY in .env" };

  let base =
    process.env.GENAI_API_BASE ||
    process.env.OPENAI_API_BASE ||
    "https://genai-sharedservice-americas.pwcinternal.com";

  base = base.replace(/\/$/, "");
  // /genai devuelve HTML (portal web), no la API REST
  if (base.endsWith("/genai")) {
    base = base.slice(0, -6);
  }

  const model =
    process.env.GENAI_MODEL ||
    process.env.OPENAI_MODEL ||
    "vertex_ai.gemini-2.5-flash";

  return { apiKey, base, model };
}

async function chatOpenAI(message, history) {
  const { apiKey, base, model, error } = getOpenAiConfig();
  if (error) throw new Error(error);

  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  for (const turn of history.slice(0, -1)) {
    const content = turn.content || "";
    if (!content) continue;
    messages.push({
      role: turn.role === "assistant" ? "assistant" : "user",
      content,
    });
  }
  messages.push({
    role: "user",
    content: `[Answer in English only] ${message}`,
  });

  const url = `${base}/v1/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    if (raw.trim().startsWith("<!DOCTYPE") || raw.includes("<html")) {
      throw new Error(
        "The server returned HTML instead of JSON. Check GENAI_API_BASE (no /genai suffix) and that you are on the PwC network/VPN."
      );
    }
    throw new Error(`Invalid API response: ${raw.slice(0, 120)}`);
  }

  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data.error || data);
    throw new Error(msg);
  }

  return data.choices?.[0]?.message?.content?.trim() || "No response.";
}

async function chatGoogle(message, history) {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing GENAI_API_KEY in .env");

  const client = new GoogleGenAI({ apiKey });
  const model = process.env.GENAI_MODEL || "gemini-2.0-flash";
  const contents = [];

  for (const turn of history.slice(0, -1)) {
    const text = turn.content || "";
    if (!text) continue;
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  });

  return (response.text || "").trim() || "No response.";
}

function useOpenAiProvider() {
  const provider = (process.env.GENAI_PROVIDER || "").toLowerCase();
  if (provider === "openai" || provider === "pwc") return true;
  if (provider === "google" || provider === "gemini") return false;

  const base = process.env.GENAI_API_BASE || process.env.OPENAI_API_BASE || "";
  if (base.includes("pwcinternal") || base.includes("genai-sharedservice")) {
    return true;
  }
  if (base && !base.includes("generativelanguage.googleapis.com")) {
    return true;
  }
  return Boolean(process.env.GENAI_API_BASE || process.env.OPENAI_API_BASE);
}

const app = express();
app.use(express.json());
app.use(express.static(ROOT));

app.get("/api/health", (_req, res) => {
  const cfg = getOpenAiConfig();
  res.json({
    ok: true,
    genai_configured: !!cfg.apiKey,
    genai_error: cfg.error || null,
    provider: useOpenAiProvider() ? "openai" : "google",
    model: cfg.model || process.env.GENAI_MODEL || "gemini-2.0-flash",
    api_base: cfg.base || null,
  });
});

app.post("/api/chat", async (req, res) => {
  const message = (req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Empty message" });

  const cfg = getOpenAiConfig();
  if (cfg.error) return res.status(503).json({ error: cfg.error });

  const prior = req.body?.history || [];

  try {
    const reply = useOpenAiProvider()
      ? await chatOpenAI(message, prior)
      : await chatGoogle(message, prior);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: `Model error: ${err.message}` });
  }
});

const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  const local = HOST === "0.0.0.0" ? "127.0.0.1" : HOST;
  console.log(`Portafolio: http://${local}:${PORT}`);
  console.log(`Proveedor:  ${useOpenAiProvider() ? "OpenAI-compatible (PwC)" : "Google Gemini"}`);
  console.log(`Health:     http://${local}:${PORT}/api/health`);
});
