import { createFileRoute } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import type { Industry } from "~/lib/types";

export const Route = createFileRoute("/industries")({
  loader: async () => {
    try {
      const res = await getCollection<Industry>("industries", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
      });
      return { industries: res.data };
    } catch {
      return { industries: [] };
    }
  },
  component: IndustriesPage,
});

function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "0.75rem",
      padding: "1.75rem",
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
      textAlign: "center",
      border: "1px solid #eef0f4",
      transition: "box-shadow .2s",
    }}>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", color: "#0f3460" }}>
        {industry.name_ar}
      </h2>
      {industry.name_en && (
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#bbb", direction: "ltr" }}>
          {industry.name_en}
        </p>
      )}
      {industry.description_ar && (
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem", lineHeight: 1.7 }}>
          {industry.description_ar}
        </p>
      )}
    </div>
  );
}

function IndustriesPage() {
  const { industries } = Route.useLoaderData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>
          القطاعات التي نخدمها
        </h1>
        <p style={{ color: "#888" }}>Industries We Serve</p>
      </header>

      {industries.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>
          لا توجد قطاعات منشورة حالياً
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}>
          {industries.map((ind) => (
            <IndustryCard key={ind.id} industry={ind} />
          ))}
        </div>
      )}
    </main>
  );
}
