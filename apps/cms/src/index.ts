import type { Core } from "@strapi/strapi";
import { bootstrapRoles }       from "./bootstrap/roles";
import { bootstrapApiTokens }   from "./bootstrap/api-tokens";
import { bootstrapPermissions } from "./bootstrap/permissions";
import { bootstrapSeed }        from "./bootstrap/seed";

export default {
  register(_: { strapi: Core.Strapi }) {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info("[bootstrap] Starting ALPHABETA bootstrap...");
    await bootstrapRoles(strapi);
    await bootstrapPermissions(strapi);
    await bootstrapApiTokens(strapi);
    await bootstrapSeed(strapi);
    strapi.log.info("[bootstrap] ✓ Complete");
  },
};

