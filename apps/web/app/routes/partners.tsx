import { createFileRoute } from "@tanstack/react-router";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import type { Partner, PartnerType } from "~/lib/types";

export const Route = createFileRoute("/partners")({
  loader: async () => {
    try {
      const [partnersRes, typesRes] = await Promise.all([
        getCollection<Partner>("partners", {
          "sort[0]": "sort_order:asc",
          "populate[logo]": "true",
          "populate[partner_type]": "true",
          "filters[publishedAt][$notNull]": "true",
          "pagination[pageSize]": "100",
        }),
        getCollection<PartnerType>("partner-types", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
      ]);
      return { partners: partnersRes.data, types: typesRes.data };
    } catch {
      return { partners: [], types: [] };
    }
  },
  component: PartnersPage,
});

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article style={{
      background: "#fff", borderRadius: "1rem", padding: "1.5rem",
      border: partner.is_featured ? "2px solid #e94560" : "1px solid #eef0f4",
      boxShadow: "0 2px 12px rgba(0,0,0,.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "0.75rem", overflow: "hidden", background: "#f1f3f8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
          {partner.logo ? (
            <img src={mediaUrl(partner.logo.url) ?? ""} alt={`شعار ${partner.name_ar}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : "🤝"}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f3460" }}>{partner.name_ar}</h3>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa", direction: "ltr", textAlign: "right" }}>{partner.name_en}</p>
        </div>
      </div>
      {partner.description_ar && (
        <p style={{ margin: "0.9rem 0 0", fontSize: "0.87rem", color: "#666", lineHeight: 1.7 }}>{partner.description_ar}</p>
      )}
      {partner.website && (
        <a
          href={partner.website} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: "0.9rem", fontSize: "0.8rem", color: "#e94560", textDecoration: "none", direction: "ltr" }}
        >
          {partner.website.replace(/^https?:\/\/(www\.)?/, "")} ↗
        </a>
      )}
    </article>
  );
}

function PartnersPage() {
  const { partners, types } = Route.useLoaderData();

  useSeo({
    title:       "شركاؤنا | ألفا بيتا",
    description: "شركاء ألفا بيتا التقنيون والاستراتيجيون",
  });

  const ungrouped = partners.filter((p) => !p.partner_type);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>شركاؤنا</h1>
        <p style={{ color: "#888" }}>Our Partners</p>
      </header>

      {partners.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>لا يوجد شركاء منشورون حالياً</p>
      ) : (
        <>
          {types.map((type) => {
            const items = partners.filter((p) => p.partner_type?.id === type.id);
            if (items.length === 0) return null;
            return (
              <section key={type.id} style={{ marginBottom: "2.5rem" }}>
                <header style={{ marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.35rem", color: "#0f3460", margin: 0 }}>{type.name_ar}</h2>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#aaa" }}>{type.name_en}</p>
                </header>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                  {items.map((p) => <PartnerCard key={p.id} partner={p} />)}
                </div>
              </section>
            );
          })}
          {ungrouped.length > 0 && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                {ungrouped.map((p) => <PartnerCard key={p.id} partner={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
