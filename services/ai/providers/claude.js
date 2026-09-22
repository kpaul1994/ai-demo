/**
 * Claude (Anthropic) provider
 * Requires: ANTHROPIC_API_KEY, optional CLAUDE_MODEL (default: claude-sonnet-4-6)
 */
const { AIProviderError } = require("../aiProvider");

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

async function callClaude({ systemPrompt, messages, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing in .env");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens || 600,
      system: systemPrompt || "You are a helpful e-commerce analytics assistant.",
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  return textBlock?.text?.trim() || "";
}

async function generateText({ systemPrompt, userPrompt, maxTokens }) {
  try {
    return await callClaude({
      systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens,
    });
  } catch (err) {
    throw new AIProviderError("claude", err);
  }
}

async function chat({ systemPrompt, messages, maxTokens }) {
  try {
    return await callClaude({ systemPrompt, messages, maxTokens });
  } catch (err) {
    throw new AIProviderError("claude", err);
  }
}

module.exports = { generateText, chat };
