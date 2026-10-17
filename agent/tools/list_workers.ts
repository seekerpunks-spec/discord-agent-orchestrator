import { defineTool } from "eve/tools";
import { z } from "zod";
import { workers } from "../lib/workers";
export default defineTool({
  description: "Liste les bots externes réellement raccordés. Une liste vide signifie qu'aucun bot externe n'est connecté.",
  inputSchema: z.object({}),
  execute: () => workers().map(({id, description}) => ({id, description})),
});
