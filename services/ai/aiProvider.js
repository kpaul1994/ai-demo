/**
 * aiProvider.js
 * ---------------------------------------------------
 * This is a "contract" — every provider (OpenAI, Claude, Groq)
 * must follow this same shape, so that the rest of the app code
 * (recommendation engine, chat controller, etc.) stays the same even when the provider changes.
 *
 * Each provider file must export these two functions:
 *
 *   async function generateText({ systemPrompt, userPrompt, maxTokens }) -> string
 *   async function chat({ systemPrompt, messages, maxTokens }) -> string
 *
 * messages format: [{ role: "user" | "assistant", content: "..." }]
 * ---------------------------------------------------
 */

class AIProviderError extends Error {
  constructor(provider, originalError) {
    super(`[${provider}] AI call failed: ${originalError.message}`);
    this.name = "AIProviderError";
    this.provider = provider;
    this.originalError = originalError;
  }
}

module.exports = { AIProviderError };
