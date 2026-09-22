/**
 * services/ai/index.js
 * ---------------------------------------------------
 * The rest of the app uses AI through this file. No one outside
 * should directly import openai.js / claude.js / groq.js —
 * always use this index.js as the "single entry point".
 *
 * Set in .env:
 *   AI_PROVIDER=groq        (or openai / claude)
 *   AI_FALLBACK_PROVIDER=openai   (optional — tried if primary fails)
 *
 * Usage:
 *   const ai = require("./services/ai");
 *   const text = await ai.generateText({ userPrompt: "..." });
 *   const reply = await ai.chat({ messages: [...] });
 * ---------------------------------------------------
 */

const openaiProvider = require("./providers/openai");
const claudeProvider = require("./providers/claude");
const groqProvider = require("./providers/groq");

const PROVIDERS = {
  openai: openaiProvider,
  claude: claudeProvider,
  groq: groqProvider,
};

function resolveProvider(name) {
  const key = (name || "").toLowerCase();
  const provider = PROVIDERS[key];
  if (!provider) {
    throw new Error(
      `Unknown AI provider "${name}". Valid options: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  return provider;
}

function getPrimaryAndFallback() {
  const primaryName = process.env.AI_PROVIDER || "groq";
  const fallbackName = process.env.AI_FALLBACK_PROVIDER || null;
  const primary = resolveProvider(primaryName);
  const fallback = fallbackName ? resolveProvider(fallbackName) : null;
  return { primary, fallback, primaryName, fallbackName };
}

async function withFallback(methodName, args) {
  const { primary, fallback, primaryName, fallbackName } = getPrimaryAndFallback();

  try {
    return await primary[methodName](args);
  } catch (err) {
    if (!fallback) throw err;
    console.warn(
      `[ai] ${primaryName} failed (${err.message}), falling back to ${fallbackName}...`
    );
    return await fallback[methodName](args);
  }
}

/**
 * @param {Object} params
 * @param {string} [params.systemPrompt]
 * @param {string} params.userPrompt
 * @param {number} [params.maxTokens]
 */
async function generateText(params) {
  return withFallback("generateText", params);
}

/**
 * @param {Object} params
 * @param {string} [params.systemPrompt]
 * @param {{role: string, content: string}[]} params.messages
 * @param {number} [params.maxTokens]
 */
async function chat(params) {
  return withFallback("chat", params);
}

/** Which provider is currently active — for debugging/UI display (e.g. "AI: Groq" badge) */
function getActiveProviderName() {
  return (process.env.AI_PROVIDER || "groq").toLowerCase();
}

module.exports = { generateText, chat, getActiveProviderName, PROVIDERS };
