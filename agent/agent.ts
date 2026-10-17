import { defineAgent } from "eve";
import { openai } from "eve/models/openai";

export default defineAgent({
  model: openai(process.env.OPENAI_MODEL || "gpt-6-luna-fast"),
  defaultTools: false,
  tool: false,
  limits: { maxInputTokensPerSession: 100000, maxOutputTokensPerSession: 12000, sessionTimeoutMs: 86400000 },
});
