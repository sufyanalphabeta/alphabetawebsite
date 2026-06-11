import type { Core } from "@strapi/strapi";

const PUBLIC_READS = [
  // Sprint 1
  "api::navigation-footer.navigation-footer.find",
  "api::navigation-header.navigation-header.find",
  "api::office.office.find",
  "api::office.office.findOne",
  "api::page.page.find",
  "api::page.page.findOne",
  "api::seo-default.seo-default.find",
  "api::site-setting.site-setting.find",
  // Sprint 2
  "api::company-profile.company-profile.find",
  "api::service.service.find",
  "api::service.service.findOne",
  "api::industry.industry.find",
  "api::industry.industry.findOne",
  "api::software-product.software-product.find",
  "api::software-product.software-product.findOne",
  "api::product-category.product-category.find",
  "api::product-category.product-category.findOne",
  "api::product-feature.product-feature.find",
  "api::product-feature.product-feature.findOne",
  "api::product-module.product-module.find",
  "api::product-module.product-module.findOne",
  // Sprint 3
  "api::product-faq.product-faq.find",
  "api::product-faq.product-faq.findOne",
  "api::contact-submission.contact-submission.create",
  // Sprint 4
  "api::client.client.find",
  "api::client.client.findOne",
  "api::partner.partner.find",
  "api::partner.partner.findOne",
  "api::partner-type.partner-type.find",
  "api::partner-type.partner-type.findOne",
  "api::testimonial.testimonial.find",
  "api::testimonial.testimonial.findOne",
  "api::success-story.success-story.find",
  "api::success-story.success-story.findOne",
  "api::success-metric.success-metric.find",
  "api::success-metric.success-metric.findOne",
];

export async function bootstrapPermissions(strapi: Core.Strapi) {
  try {
    const roleQuery  = strapi.db.query("plugin::users-permissions.role");
    const permQuery  = strapi.db.query("plugin::users-permissions.permission");

    const publicRole = await roleQuery.findOne({ where: { type: "public" } }) as
      | { id: number } | null;

    if (!publicRole) {
      strapi.log.warn("[bootstrap:permissions] Public role not found — skipping");
      return;
    }

    const existing = await permQuery.findMany({ where: { role: publicRole.id } }) as
      Array<{ action: string }>;
    const existingActions = new Set(existing.map((p) => p.action));

    let granted = 0;
    for (const action of PUBLIC_READS) {
      if (!existingActions.has(action)) {
        await permQuery.create({ data: { action, role: publicRole.id } });
        granted++;
      }
    }

    if (granted > 0) {
      strapi.log.info(`[bootstrap:permissions] Granted ${granted} public read actions`);
    }
    strapi.log.info("[bootstrap:permissions] ✓ Permissions ready");
  } catch (err) {
    strapi.log.warn(`[bootstrap:permissions] ⚠ ${String(err)}`);
  }
}
