import { z } from "zod";
const Worker = z.object({
  id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
  description: z.string().max(500),
  url: z.url().refine(v => { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password && !u.search && !u.hash; }),
  tokenEnv: z.string().regex(/^[A-Z][A-Z0-9_]+$/),
});
export function workers(env: NodeJS.ProcessEnv = process.env) {
  const result = z.array(Worker).max(10).parse(JSON.parse(env.WORKERS_JSON || "[]"));
  if (new Set(result.map(x => x.id)).size !== result.length) throw new Error("Identifiants de workers dupliqués");
  return result;
}
export async function dispatch(workerId: string, task: string, requestId: string, env: NodeJS.ProcessEnv = process.env, transport: typeof fetch = fetch) {
  const worker = workers(env).find(w => w.id === workerId);
  if (!worker) throw new Error("Bot externe non configuré");
  const token = env[worker.tokenEnv];
  if (!token) throw new Error("Authentification du bot externe manquante");
  const response = await transport(worker.url, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(45000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": requestId },
    body: JSON.stringify({ task, requestId }),
  });
  if (!response.ok) throw new Error(`Bot externe : HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Réponse vide");
  let size = 0; const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 64000) throw new Error("Réponse du bot trop volumineuse");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const data = z.object({ output: z.string().max(16000) }).parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  return { worker: worker.id, output: data.output };
}
