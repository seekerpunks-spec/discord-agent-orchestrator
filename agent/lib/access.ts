export type Caller = { guildId?: string; channelId: string; user: { id: string; isBot: boolean } };
const ids = (value = "") => value.split(",").map(x => x.trim()).filter(Boolean);
export function authorize(caller: Caller, env: NodeJS.ProcessEnv = process.env) {
  const users = ids(env.DISCORD_ALLOWED_USER_IDS);
  const channels = ids(env.DISCORD_ALLOWED_CHANNEL_IDS);
  if (!env.DISCORD_GUILD_ID || caller.guildId !== env.DISCORD_GUILD_ID || caller.user.isBot || !users.includes(caller.user.id)) return null;
  if (channels.length && !channels.includes(caller.channelId)) return null;
  return { auth: { principalId: caller.user.id, principalType: "user" as const, authenticator: "discord", attributes: { guild_id: caller.guildId, channel_id: caller.channelId } } };
}
