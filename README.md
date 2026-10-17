# discord-agent-orchestrator

> ⚠️ **Prototype, not tested live.** It compiles and its unit tests pass, but it has never been connected to a real Discord application or run against the OpenAI API.

A Discord bot that sends a request to a small team of AI sub-agents (planner, developer, reviewer) and merges their answers. It's built on the [eve](https://eve.dev) agent framework and its native Discord channel, with an OpenAI model behind it. The bot's prompts and replies are in French.

## What it does

- **Slash commands:**
  - `/ask message:` answers a request or does the work with the tools that are actually available.
  - `/plan message:` breaks a goal into a plan (owners, dependencies, acceptance criteria) without calling any external bot.
  - `/team message:` splits the work between the internal `planner`, `developer` and `reviewer` sub-agents, then synthesises their output. It makes at most three internal delegations before asking the user to narrow the scope.
- **Allow-listed access** ([`agent/lib/access.ts`](agent/lib/access.ts)):
  - Only one configured server and a list of user IDs, optionally restricted to certain channels.
  - Bots and DMs are rejected.
  - An empty configuration means nobody has access.
- **External workers with confirmation** ([`agent/lib/workers.ts`](agent/lib/workers.ts)):
  - Other bots can be connected through an HTTPS contract (`POST /task` with a bearer token and an idempotency key).
  - URLs are validated with zod (HTTPS only, no credentials or query string) and redirects are refused.
  - Response size is capped (64 KB in total, 16,000 characters of output) with a 45-second timeout.
  - The user has to confirm before any task is sent, and the confirmation shows the exact task.
- **Prompt-injection posture.** Worker replies and quoted text are treated as data, not instructions. The agent is told never to claim it ran or tested code when no tool did.
- **Per-session token limits** and a fresh session for every slash command. Memory between commands is not promised.
- Discord signature verification, quick acknowledgement, long-reply splitting and confirmation buttons all come from eve's Discord channel.

## Project layout

```
agent/
  agent.ts                 model + session limits
  instructions.md          root agent instructions
  channels/discord.ts      slash-command routing + access check
  subagents/{planner,developer,reviewer}/
  tools/{list_workers,delegate_worker}.ts
  lib/{access,workers}.ts
scripts/doctor.mjs         config sanity check
scripts/register.mjs       registers /ask /plan /team on one server and prints an invite link
tests/                     node:test unit tests (access control, worker dispatch)
```

## Running it

You need Node.js 24, a Discord application, an OpenAI API key, and a host for the interactions webhook (eve deploys to Vercel).

```bash
npm ci
cp .env.example .env       # fill in values locally, never commit them
npm run doctor
npm test
npm run typecheck
npm run build
```

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Model access |
| `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN` | Discord application |
| `DISCORD_GUILD_ID` | The one server the bot answers in |
| `DISCORD_ALLOWED_USER_IDS` | Comma-separated allow-list |
| `DISCORD_ALLOWED_CHANNEL_IDS` | Optional channel allow-list |
| `WORKERS_JSON` | Optional list (max 10) of trusted HTTPS workers: `id`, `description`, `url`, `tokenEnv` |

After deploying, point the Discord **Interactions Endpoint URL** at `<your deployment>/eve/v1/discord`, then run `npm run register`. The bot doesn't need Administrator permission or the Message Content intent.

## Status

- ✅ Unit tests, typecheck and build passed locally.
- ❌ No real Discord install, no real OpenAI call, no external worker connected, not deployed.

The sub-agents analyse and draft. They have no terminal, browser, GitHub or deployment access.
