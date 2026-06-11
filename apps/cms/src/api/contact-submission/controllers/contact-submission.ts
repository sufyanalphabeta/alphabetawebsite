import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::contact-submission.contact-submission",
  () => ({
    async create(ctx) {
      const body = ctx.request.body as { data?: Record<string, unknown> };
      body.data = {
        ...(body.data ?? {}),
        ip_address: ctx.request.ip ?? "",
        source_url: ctx.get("Referer") ?? "",
        locale:     ctx.get("Accept-Language")?.split(",")[0] ?? "ar",
        status:     "new",
      };
      return super.create(ctx);
    },
  })
);
