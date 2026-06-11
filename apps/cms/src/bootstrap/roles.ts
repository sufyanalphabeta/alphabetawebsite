import type { Core } from "@strapi/strapi";

const CUSTOM_ROLES = [
  { name: "Content Editor",  description: "Manages pages, blog, news, site settings." },
  { name: "Product Manager", description: "Manages software products, categories, downloads." },
  { name: "Support Manager", description: "Manages support topics, channels, docs, tickets." },
  { name: "Sales",           description: "Read-only: demo/quote/contact submission inboxes." },
  { name: "HR",              description: "Manages job openings and career applications." },
  { name: "Translator",      description: "Read all; write only non-default locale content." },
];

export async function bootstrapRoles(strapi: Core.Strapi) {
  try {
    const svc = strapi.admin.services.role;
    const raw = await svc.find();
    const list: Array<{ name: string }> = Array.isArray(raw)
      ? raw
      : (raw as { results?: Array<{ name: string }> }).results ?? [];
    const existing = new Set(list.map((r) => r.name));
    for (const role of CUSTOM_ROLES) {
      if (!existing.has(role.name)) {
        await svc.create(role);
        strapi.log.info(`[bootstrap:roles] Created: ${role.name}`);
      }
    }
    strapi.log.info("[bootstrap:roles] ✓ Roles ready");
  } catch (err) {
    strapi.log.warn(`[bootstrap:roles] ⚠ ${String(err)}`);
  }
}
