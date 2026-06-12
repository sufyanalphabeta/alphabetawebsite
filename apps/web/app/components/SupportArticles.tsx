import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cx, EmptyState } from "~/components/ui";
import type { BlocksNode, BlocksTextNode, SupportArticle } from "~/lib/types";

const FIELD =
  "rounded-lg border border-slate-200 bg-card px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary-400 focus:outline-none";

function blocksToParagraphs(nodes: BlocksNode[] | null) {
  if (!nodes?.length) return null;
  return nodes.map((node, i) => {
    const text = (node.children ?? [])
      .map((c) => ("text" in c ? (c as BlocksTextNode).text : ""))
      .join("");
    if (!text.trim()) return null;
    return <p key={i} className="mt-3 text-sm leading-loose text-slate-600">{text}</p>;
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
      <div className="mb-7 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-card">
        <label className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في المقالات…"
            className={cx(FIELD, "w-full pe-9")}
            aria-label="بحث"
          />
        </label>
        {!lockedCategorySlug && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={FIELD} aria-label="القسم">
            <option value="">كل الأقسام</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name_ar}</option>)}
          </select>
        )}
        <select value={product} onChange={(e) => setProduct(e.target.value)} className={FIELD} aria-label="النظام">
          <option value="">كل الأنظمة</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="لا توجد مقالات مطابقة" />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <details key={a.id} className="group rounded-xl border border-slate-200 bg-card shadow-card">
              <summary className="flex cursor-pointer items-start justify-between gap-4 p-5">
                <span className="min-w-0">
                  <span className="block font-bold text-primary-900">{a.title_ar}</span>
                  <span className="mt-1.5 flex flex-wrap gap-2">
                    {a.category && (
                      <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">{a.category.name_ar}</span>
                    )}
                    {a.software_product && (
                      <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">{a.software_product.name_ar}</span>
                    )}
                  </span>
                  {a.excerpt_ar && (
                    <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">{a.excerpt_ar}</span>
                  )}
                </span>
                <ChevronDown size={18} className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 px-5 pb-5">{blocksToParagraphs(a.body_ar)}</div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
