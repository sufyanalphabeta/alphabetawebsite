import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import type { Client } from "~/lib/types";

export const Route = createFileRoute("/clients")({
  loader: async () => {
    try {
      const res = await getCollection<Client>("clients", {
        "sort[0]": "sort_order:asc",
        "populate[logo]": "true",
        "populate[industry]": "true",
        "populate[software_products]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "100",
      });
      return { clients: res.data };
    } catch {
      return { clients: [] };
    }
  },
  component: ClientsPage,
});

function ClientsPage() {
  const { clients } = Route.useLoaderData();

  useSeo({
    title:       "عملاؤنا | ألفا بيتا",
    description: "مؤسسات وشركات تثق في أنظمة ألفا بيتا البرمجية",
  });

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>عملاؤنا</h1>
        <p style={{ color: "#888" }}>Our Clients</p>
      </header>

      {clients.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>لا يوجد عملاء منشورون حالياً</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {clients.map((client) => (
            <article
              key={client.id}
              style={{
                background: "#fff", borderRadius: "1rem", padding: "1.5rem",
                border: client.is_featured ? "2px solid #e94560" : "1px solid #eef0f4",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: "0.75rem", overflow: "hidden", background: "#f1f3f8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                  {client.logo ? (
                    <img src={mediaUrl(client.logo.url) ?? ""} alt={`شعار ${client.name_ar}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : "🏢"}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.05rem", color: "#0f3460" }}>{client.name_ar}</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa", direction: "ltr", textAlign: "right" }}>{client.name_en}</p>
                </div>
                {client.is_featured && (
                  <span style={{ marginRight: "auto", fontSize: "0.65rem", background: "#e94560", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: 999 }}>مميز</span>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
                {client.industry && (
                  <span style={{ fontSize: "0.72rem", background: "#eef0f4", color: "#0f3460", padding: "0.2rem 0.6rem", borderRadius: 999 }}>
                    {client.industry.name_ar}
                  </span>
                )}
                {client.country_ar && (
                  <span style={{ fontSize: "0.72rem", background: "#eef0f4", color: "#0f3460", padding: "0.2rem 0.6rem", borderRadius: 999 }}>
                    📍 {client.country_ar}
                  </span>
                )}
              </div>

              {client.description_ar && (
                <p style={{ margin: "0.9rem 0 0", fontSize: "0.87rem", color: "#666", lineHeight: 1.7 }}>{client.description_ar}</p>
              )}

              {(client.software_products?.length ?? 0) > 0 && (
                <div style={{ marginTop: "1rem", paddingTop: "0.9rem", borderTop: "1px solid #f1f3f8" }}>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", color: "#aaa" }}>الأنظمة المستخدمة</p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {client.software_products!.map((p) => (
                      <Link
                        key={p.id}
                        to="/software/$slug" params={{ slug: p.slug }}
                        style={{ fontSize: "0.75rem", color: "#e94560", textDecoration: "none", border: "1px solid #f7c8d2", padding: "0.2rem 0.6rem", borderRadius: 999 }}
                      >
                        {p.name_ar}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
