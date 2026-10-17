const required = ['OPENAI_API_KEY','DISCORD_APPLICATION_ID','DISCORD_PUBLIC_KEY','DISCORD_BOT_TOKEN','DISCORD_GUILD_ID','DISCORD_ALLOWED_USER_IDS'];
let valid = true;
for (const name of required) {
  const value = process.env[name]?.trim();
  const ok = Boolean(value) && (name === 'DISCORD_PUBLIC_KEY' ? /^[a-f0-9]{64}$/i.test(value) : name.endsWith('_ID') ? /^\d{17,20}$/.test(value) : name === 'DISCORD_ALLOWED_USER_IDS' ? value.split(',').every(x=>/^\d{17,20}$/.test(x.trim())) : true);
  console.log(`${ok ? 'OK' : 'MANQUANT/INVALIDE'} ${name}`); valid &&= ok;
}
process.exitCode = valid ? 0 : 1;
