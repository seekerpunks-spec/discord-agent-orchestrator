import { defineAgent } from "eve";
import { openai } from "eve/models/openai";
export default defineAgent({ model: openai(process.env.OPENAI_MODEL || "gpt-6-luna-fast"), defaultTools: false, tool: true, description: "R\u00e9dige et analyse du code \u00e0 partir du contexte fourni.", limits: { maxInputTokensPerSession: 30000, maxOutputTokensPerSession: 4000 } });
