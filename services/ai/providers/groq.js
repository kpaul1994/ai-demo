/**
 * Groq provider (OpenAI-compatible chat completions endpoint)
 * Requires: GROQ_API_KEY, optional GROQ_MODEL (default: llama-3.3-70b-versatile)
 */
const { AIProviderError } = require("../aiProvider");

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

async function callGroq(messages, maxTokens) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens || 600,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function generateText({ systemPrompt, userPrompt, maxTokens }) {
  try {
    const messages = [
      { role: "system", content: systemPrompt || "You are a helpful assistant." },
      { role: "user", content: userPrompt },
    ];
    return await callGroq(messages, maxTokens);
  } catch (err) {
    throw new AIProviderError("groq", err);
  }
}

async function chat({ systemPrompt, messages, maxTokens }) {
  try {
    const fullMessages = [
      { role: "system", content: systemPrompt || "You are a helpful e-commerce analytics assistant." },
      ...messages,
    ];
    return await callGroq(fullMessages, maxTokens);
  } catch (err) {
    throw new AIProviderError("groq", err);
  }
}

module.exports = { generateText, chat };
