import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import type { FaqCategory, FaqItem } from "~/lib/types";

export const Route = createFileRoute("/faq")({
  loader: async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        getCollection<FaqCategory>("faq-categories", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
        getCollection<FaqItem>("faq-items", {
          "sort[0]": "sort_order:asc",
          "populate[category]": "true",
          "populate[software_product]": "true",
          "filters[publishedAt][$notNull]": "true",
          "pagination[pageSize]": "100",
        }),
      ]);
      return { categories: catsRes.data, items: itemsRes.data };
    } catch {
      return { categories: [], items: [] };
    }
  },
  component: FaqPage,
});

function FaqPage() {
  const { categories, items } = Route.useLoaderData();
  const [query, setQuery]     = useState("");
  const [product, setProduct] = useState("");

  useSeo({
    title:       "الأسئلة الشائعة | ألفا بيتا",
    description: "إجابات لأكثر الأسئلة تكراراً حول أنظمة وخدمات ألفا بيتا",
  });

  const products = useMemo(
    () => [...new Map(items.filter((i) => i.software_product).map((i) => [i.software_product!.slug, i.software_product!])).values()],
    [items],
  );

  const filtered = items.filter((item) => {
    if (product && item.software_product?.slug !== product) return false;
    if (query) {
      const q = query.trim().toLowerCase();
      const haystack = [item.question_ar, item.question_en, item.answer_ar, item.answer_en]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <main style={{ maxWidth: "850px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>الأسئلة الشائعة</h1>
        <p style={{ color: "#888" }}>FAQ Center</p>
      </header>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 ابحث في الأسئلة…"
          style={{ flex: 1, minWidth: 220, padding: "0.5rem 0.75rem", fontSize: "0.85rem", border: "1px solid #d8dde6", borderRadius: "0.5rem", fontFamily: "inherit" }}
          aria-label="بحث"
        />
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", border: "1px solid #d8dde6", borderRadius: "0.5rem", background: "#fff", fontFamily: "inherit" }}
          aria-label="النظام"
        >
          <option value="">كل الأنظمة</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "3rem 0" }}>لا توجد أسئلة مطابقة</p>
      ) : (
        categories.map((cat) => {
          const catItems = filtered.filter((i) => i.category?.id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id} style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#0f3460", marginBottom: "0.9rem" }}>{cat.name_ar}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                {catItems.map((item) => (
                  <details key={item.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.75rem", padding: "1rem 1.25rem" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#0f3460" }}>
                      {item.question_ar}
                      {item.software_product && (
                        <span style={{ marginRight: "0.6rem", fontSize: "0.68rem", background: "#eef0f4", color: "#0f3460", padding: "0.12rem 0.5rem", borderRadius: 999, fontWeight: 400 }}>
                          {item.software_product.name_ar}
                        </span>
                      )}
                    </summary>
                    {item.answer_ar && (
                      <p style={{ margin: "0.75rem 0 0", color: "#555", lineHeight: 1.8, fontSize: "0.9rem" }}>{item.answer_ar}</p>
                    )}
                  </details>
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* Items without a category */}
      {(() => {
        const uncategorized = filtered.filter((i) => !i.category);
        if (uncategorized.length === 0) return null;
        return (
          <section>
            {uncategorized.map((item) => (
              <details key={item.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "0.7rem" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, color: "#0f3460" }}>{item.question_ar}</summary>
                {item.answer_ar && <p style={{ margin: "0.75rem 0 0", color: "#555", lineHeight: 1.8, fontSize: "0.9rem" }}>{item.answer_ar}</p>}
              </details>
            ))}
          </section>
        );
      })()}

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>
          لم تجد إجابتك؟ <Link to="/contact" style={{ color: "#e94560" }}>تواصل معنا</Link> أو تصفح <Link to="/support" style={{ color: "#e94560" }}>مركز الدعم</Link>
        </p>
      </div>
    </main>
  );
}
