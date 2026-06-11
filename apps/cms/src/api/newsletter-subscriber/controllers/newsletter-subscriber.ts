import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::newsletter-subscriber.newsletter-subscriber",
  () => ({
    async create(ctx) {
      const body = ctx.request.body as { data?: Record<string, unknown> };
      body.data = { ...(body.data ?? {}), subscribed_at: new Date().toISOString() };
      return super.create(ctx);
    },
  })
);
