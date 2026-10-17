const { DISCORD_APPLICATION_ID: app, DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guild } = process.env;
if (!app || !token || !guild) throw new Error('Configuration Discord incomplète. Lance npm run doctor.');
for (const [name, description] of [['ask','Parler à ton orchestrateur'],['plan','Préparer un plan sans exécution externe'],['team','Faire travailler les spécialistes']]) {
  const response = await fetch(`https://discord.com/api/v10/applications/${app}/guilds/${guild}/commands`, {
    method:'POST', headers:{ Authorization:`Bot ${token}`, 'Content-Type':'application/json' },
    body:JSON.stringify({name, description, type:1, options:[{name:'message',description:'Ta demande',type:3,required:true,max_length:6000}]})
  });
  if (!response.ok) throw new Error(`Enregistrement ${name} : HTTP ${response.status}`);
  console.log(`Enregistré : /${name}`);
}
const url=new URL('https://discord.com/oauth2/authorize');
url.search=new URLSearchParams({client_id:app,scope:'bot applications.commands',permissions:'3072',guild_id:guild,disable_guild_select:'true'}).toString();
console.log('Invitation : '+url);
