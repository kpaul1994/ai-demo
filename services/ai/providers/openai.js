/**
 * OpenAI provider
 * Requires: OPENAI_API_KEY, optional OPENAI_MODEL (default: gpt-4o-mini)
 */
const { AIProviderError } = require("../aiProvider");

const API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function callOpenAI(messages, maxTokens) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing in .env");

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
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
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
    return await callOpenAI(messages, maxTokens);
  } catch (err) {
    throw new AIProviderError("openai", err);
  }
}

async function chat({ systemPrompt, messages, maxTokens }) {
  try {
    const fullMessages = [
      { role: "system", content: systemPrompt || "You are a helpful e-commerce analytics assistant." },
      ...messages,
    ];
    return await callOpenAI(fullMessages, maxTokens);
  } catch (err) {
    throw new AIProviderError("openai", err);
  }
}

module.exports = { generateText, chat };
