import { useMemo, useState } from "react";
import type { BlocksNode, BlocksTextNode, SupportArticle } from "~/lib/types";

const SELECT_STYLE: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  border: "1px solid #d8dde6",
  borderRadius: "0.5rem",
  background: "#fff",
  fontFamily: "inherit",
};

function blocksToParagraphs(nodes: BlocksNode[] | null) {
  if (!nodes?.length) return null;
  return nodes.map((node, i) => {
    const text = (node.children ?? [])
      .map((c) => ("text" in c ? (c as BlocksTextNode).text : ""))
      .join("");
    if (!text.trim()) return null;
    return <p key={i} style={{ margin: "0.6rem 0 0", color: "#555", lineHeight: 1.9, fontSize: "0.9rem" }}>{text}</p>;
  });
}

export interface SupportArticlesProps {
  articles: SupportArticle[];
  /** When set (category page), the category filter is hidden. */
  lockedCategorySlug?: string;
}

export function SupportArticles({ articles, lockedCategorySlug }: SupportArticlesProps) {
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct]   = useState("");

  const categories = useMemo(
    () => [...new Map(articles.filter((a) => a.category).map((a) => [a.category!.slug, a.category!])).values()],
    [articles],
  );
  const products = useMemo(
    () => [...new Map(articles.filter((a) => a.software_product).map((a) => [a.software_product!.slug, a.software_product!])).values()],
    [articles],
  );

  const filtered = articles.filter((a) => {
    if (lockedCategorySlug && a.category?.slug !== lockedCategorySlug) return false;
    if (category && a.category?.slug !== category) return false;
    if (product && a.software_product?.slug !== product) return false;
    if (query) {
      const q = query.trim().toLowerCase();
      const haystack = [a.title_ar, a.title_en, a.excerpt_ar, a.excerpt_en].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 ابحث في المقالات…"
          style={{ ...SELECT_STYLE, flex: 1, minWidth: 220 }}
          aria-label="بحث"
        />
        {!lockedCategorySlug && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={SELECT_STYLE} aria-label="القسم">
            <option value="">كل الأقسام</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name_ar}</option>)}
          </select>
        )}
        <select value={product} onChange={(e) => setProduct(e.target.value)} style={SELECT_STYLE} aria-label="النظام">
          <option value="">كل الأنظمة</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "3rem 0" }}>لا توجد مقالات مطابقة</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {filtered.map((a) => (
            <details key={a.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.85rem", padding: "1.1rem 1.35rem" }}>
              <summary style={{ cursor: "pointer" }}>
                <span style={{ fontWeight: 700, color: "#0f3460" }}>{a.title_ar}</span>
                <span style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem", fontSize: "0.72rem" }}>
                  {a.category && <span style={{ background: "#eef0f4", color: "#0f3460", padding: "0.15rem 0.55rem", borderRadius: 999 }}>{a.category.name_ar}</span>}
                  {a.software_product && <span style={{ background: "#eef0f4", color: "#0f3460", padding: "0.15rem 0.55rem", borderRadius: 999 }}>{a.software_product.name_ar}</span>}
                </span>
                {a.excerpt_ar && <span style={{ display: "block", marginTop: "0.4rem", fontSize: "0.83rem", color: "#777", fontWeight: 400 }}>{a.excerpt_ar}</span>}
              </summary>
              {blocksToParagraphs(a.body_ar)}
            </details>
          ))}
        </div>
      )}
    </>
  );
}
