import { defineAgent } from "eve";
import { openai } from "eve/models/openai";
export default defineAgent({ model: openai(process.env.OPENAI_MODEL || "gpt-6-luna-fast"), defaultTools: false, tool: true, description: "V\u00e9rifie les incoh\u00e9rences, risques et omissions dans un livrable.", limits: { maxInputTokensPerSession: 30000, maxOutputTokensPerSession: 4000 } });
