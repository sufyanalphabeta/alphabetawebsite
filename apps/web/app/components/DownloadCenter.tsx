import { useMemo, useState } from "react";
import { mediaUrl } from "~/lib/strapi";
import { formatFileSize, formatDate, LANGUAGE_LABEL, fileExtBadge } from "~/lib/format";
import type { DownloadCenterItem } from "~/lib/types";

const SELECT_STYLE: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  border: "1px solid #d8dde6",
  borderRadius: "0.5rem",
  background: "#fff",
  fontFamily: "inherit",
};

export interface DownloadCenterProps {
  items: DownloadCenterItem[];
  /** When set (category page), the category filter is hidden. */
  lockedCategorySlug?: string;
}

export function DownloadCenter({ items, lockedCategorySlug }: DownloadCenterProps) {
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct]   = useState("");
  const [language, setLanguage] = useState("");

  const categories = useMemo(
    () => [...new Map(items.filter((i) => i.category).map((i) => [i.category!.slug, i.category!])).values()],
    [items],
  );
  const products = useMemo(
    () => [...new Map(items.filter((i) => i.software_product).map((i) => [i.software_product!.slug, i.software_product!])).values()],
    [items],
  );

  const filtered = items.filter((item) => {
    if (lockedCategorySlug && item.category?.slug !== lockedCategorySlug) return false;
    if (category && item.category?.slug !== category) return false;
    if (product && item.software_product?.slug !== product) return false;
    if (language && item.language !== language) return false;
    if (query) {
      const q = query.trim().toLowerCase();
      const haystack = [item.title_ar, item.title_en, item.description_ar, item.description_en]
        .filter(Boolean).join(" ").toLowerCase();
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
          placeholder="🔍 ابحث في الملفات…"
          style={{ ...SELECT_STYLE, flex: 1, minWidth: 220 }}
          aria-label="بحث"
        />
        {!lockedCategorySlug && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={SELECT_STYLE} aria-label="الفئة">
            <option value="">كل الفئات</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name_ar}</option>)}
          </select>
        )}
        <select value={product} onChange={(e) => setProduct(e.target.value)} style={SELECT_STYLE} aria-label="النظام">
          <option value="">كل الأنظمة</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={SELECT_STYLE} aria-label="اللغة">
          <option value="">كل اللغات</option>
          <option value="ar">{LANGUAGE_LABEL.ar}</option>
          <option value="en">{LANGUAGE_LABEL.en}</option>
          <option value="both">{LANGUAGE_LABEL.both}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "3rem 0" }}>لا توجد ملفات مطابقة</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {filtered.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.85rem",
                padding: "1.1rem 1.35rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: "0.6rem", background: "#0f3460", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
              }}>
                {fileExtBadge(item.file?.ext)}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f3460" }}>{item.title_ar}</h3>
                {item.description_ar && (
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#777" }}>{item.description_ar}</p>
                )}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem", fontSize: "0.72rem", color: "#888" }}>
                  {item.category && <span style={{ background: "#eef0f4", color: "#0f3460", padding: "0.15rem 0.55rem", borderRadius: 999 }}>{item.category.name_ar}</span>}
                  {item.software_product && <span style={{ background: "#eef0f4", color: "#0f3460", padding: "0.15rem 0.55rem", borderRadius: 999 }}>{item.software_product.name_ar}</span>}
                  <span style={{ background: "#eef0f4", color: "#0f3460", padding: "0.15rem 0.55rem", borderRadius: 999 }}>{LANGUAGE_LABEL[item.language]}</span>
                  {item.version && <span>الإصدار {item.version}</span>}
                  {item.release_date && <span>{formatDate(item.release_date)}</span>}
                  {item.file && <span>{formatFileSize(item.file.size)}</span>}
                </div>
              </div>
              {item.file && (
                <a
                  href={mediaUrl(item.file.url) ?? "#"}
                  download
                  style={{
                    background: "#e94560", color: "#fff", padding: "0.55rem 1.3rem",
                    borderRadius: "0.5rem", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⬇ تحميل
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
