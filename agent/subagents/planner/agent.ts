import { defineAgent } from "eve";
import { openai } from "eve/models/openai";
export default defineAgent({ model: openai(process.env.OPENAI_MODEL || "gpt-6-luna-fast"), defaultTools: false, tool: true, description: "D\u00e9compose une demande en \u00e9tapes concr\u00e8tes et v\u00e9rifiables.", limits: { maxInputTokensPerSession: 30000, maxOutputTokensPerSession: 4000 } });
