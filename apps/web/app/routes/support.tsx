import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { SupportArticles } from "~/components/SupportArticles";
import type { SupportArticle, SupportCategory } from "~/lib/types";

export const Route = createFileRoute("/support")({
  loader: async () => {
    try {
      const [catsRes, articlesRes] = await Promise.all([
        getCollection<SupportCategory>("support-categories", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
        getCollection<SupportArticle>("support-articles", {
          "sort[0]": "sort_order:asc",
          "populate[category]": "true",
          "populate[software_product]": "true",
          "filters[publishedAt][$notNull]": "true",
          "pagination[pageSize]": "100",
        }),
      ]);
      return { categories: catsRes.data, articles: articlesRes.data };
    } catch {
      return { categories: [], articles: [] };
    }
  },
  component: SupportPage,
});

const CATEGORY_ICON: Record<string, string> = {
  "installation-guides": "🛠️",
  "user-manuals":        "📘",
  "troubleshooting":     "🔧",
};

function SupportPage() {
  const { categories, articles } = Route.useLoaderData();

  useSeo({
    title:       "مركز الدعم | ألفا بيتا",
    description: "أدلة التثبيت والاستخدام وحل المشكلات لأنظمة ألفا بيتا",
  });

  return (
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>مركز الدعم</h1>
        <p style={{ color: "#888" }}>Support Center</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to="/support/category/$slug" params={{ slug: cat.slug }}
            style={{
              background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.85rem",
              padding: "1.4rem", textDecoration: "none", textAlign: "center",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>{CATEGORY_ICON[cat.slug] ?? "📄"}</span>
            <h2 style={{ margin: "0.6rem 0 0", fontSize: "1rem", color: "#0f3460" }}>{cat.name_ar}</h2>
            {cat.description_ar && (
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "#888" }}>{cat.description_ar}</p>
            )}
          </Link>
        ))}
        <Link
          to="/faq"
          style={{
            background: "#0f3460", border: "1px solid #0f3460", borderRadius: "0.85rem",
            padding: "1.4rem", textDecoration: "none", textAlign: "center",
          }}
        >
          <span style={{ fontSize: "1.8rem" }}>❓</span>
          <h2 style={{ margin: "0.6rem 0 0", fontSize: "1rem", color: "#fff" }}>الأسئلة الشائعة</h2>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,.6)" }}>إجابات لأكثر الأسئلة تكراراً</p>
        </Link>
      </div>

      <SupportArticles articles={articles} />

      <div style={{ marginTop: "3rem", background: "#f7f8fb", borderRadius: "1rem", padding: "1.75rem", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#555" }}>لم تجد ما تبحث عنه؟</p>
        <Link to="/contact" style={{ display: "inline-block", marginTop: "0.75rem", background: "#e94560", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600 }}>
          تواصل مع الدعم الفني
        </Link>
      </div>
    </main>
  );
}
