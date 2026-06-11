import { createFileRoute } from "@tanstack/react-router";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import type { Testimonial } from "~/lib/types";

export const Route = createFileRoute("/testimonials")({
  loader: async () => {
    try {
      const res = await getCollection<Testimonial>("testimonials", {
        "sort[0]": "sort_order:asc",
        "populate[image]": "true",
        "populate[client]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "100",
      });
      return { testimonials: res.data };
    } catch {
      return { testimonials: [] };
    }
  },
  component: TestimonialsPage,
});

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`التقييم ${rating} من 5`} style={{ color: "#f5a623", letterSpacing: 2 }}>
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
      <span style={{ color: "#dde2ea" }}>{"★".repeat(5 - Math.max(0, Math.min(5, rating)))}</span>
    </span>
  );
}

function TestimonialsPage() {
  const { testimonials } = Route.useLoaderData();

  useSeo({
    title:       "آراء العملاء | ألفا بيتا",
    description: "ماذا يقول عملاؤنا عن أنظمة ألفا بيتا",
  });

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>آراء العملاء</h1>
        <p style={{ color: "#888" }}>Testimonials</p>
      </header>

      {testimonials.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>لا توجد آراء منشورة حالياً</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {testimonials.map((t) => (
            <article
              key={t.id}
              style={{
                background: "#fff", borderRadius: "1rem", padding: "1.75rem",
                border: t.is_featured ? "2px solid #e94560" : "1px solid #eef0f4",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                display: "flex", flexDirection: "column", gap: "1rem",
              }}
            >
              <Stars rating={t.rating} />
              <blockquote style={{ margin: 0, color: "#444", lineHeight: 1.9, fontSize: "0.95rem", flex: 1 }}>
                "{t.text_ar}"
              </blockquote>
              <footer style={{ display: "flex", alignItems: "center", gap: "0.85rem", paddingTop: "1rem", borderTop: "1px solid #f1f3f8" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "#f1f3f8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.image ? (
                    <img src={mediaUrl(t.image.url) ?? ""} alt={t.customer_name_ar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : "👤"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0f3460", fontSize: "0.92rem" }}>{t.customer_name_ar}</p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#888" }}>
                    {[t.position_ar, t.company_ar ?? t.client?.name_ar].filter(Boolean).join(" — ")}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
