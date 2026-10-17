import { discordChannel } from "eve/channels/discord";
import { authorize } from "../lib/access";

export default discordChannel({
  onCommand: (_ctx, interaction) => {
    if (!["ask", "plan", "team"].includes(interaction.commandName)) return null;
    const access = authorize(interaction);
    if (!access) return null;
    return { ...access, context: [`Mode demandé : ${interaction.commandName}.`], title: `Discord /${interaction.commandName}` };
  },
  onInputResponse: (_ctx, interaction) => authorize(interaction),
});
