import type { Core } from "@strapi/strapi";

export async function bootstrapApiTokens(strapi: Core.Strapi) {
  try {
    const TOKEN_NAME = "Frontend Read-Only";

    const existing = await strapi.db
      .query("admin::api-token")
      .findOne({ where: { name: TOKEN_NAME } });

    if (existing) {
      strapi.log.info("[bootstrap:api-tokens] ✓ Tokens ready (existing token kept)");
      return;
    }

    const svc = strapi.service("admin::api-token") as {
      create(
        attributes: Record<string, unknown>,
        callingUser?: unknown
      ): Promise<{ accessKey: string }>;
    };

    const token = await svc.create({
      name: TOKEN_NAME,
      description: "Used by the web frontend (read-only access).",
      kind: "content-api",
      type: "read-only",
      lifespan: null,
    });

    strapi.log.info("=".repeat(60));
    strapi.log.info("⚠️  COPY THIS TO apps/web/.env:");
    strapi.log.info(`VITE_STRAPI_API_TOKEN=${token.accessKey}`);
    strapi.log.info("=".repeat(60));

    strapi.log.info("[bootstrap:api-tokens] ✓ Tokens ready");
  } catch (err) {
    strapi.log.warn(`[bootstrap:api-tokens] ⚠ ${String(err)}`);
  }
}
