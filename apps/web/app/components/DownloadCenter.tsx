import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { mediaUrl } from "~/lib/strapi";
import { formatFileSize, formatDate, LANGUAGE_LABEL, fileExtBadge } from "~/lib/format";
import { cx, EmptyState } from "~/components/ui";
import type { DownloadCenterItem } from "~/lib/types";

const FIELD =
  "rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary-400 focus:outline-none";

const EXT_COLOR: Record<string, string> = {
  PDF:  "bg-red-600",
  ZIP:  "bg-amber-500",
  DOCX: "bg-blue-600",
  PPTX: "bg-orange-600",
  XLSX: "bg-emerald-600",
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
      {/* Filter toolbar */}
      <div className="mb-7 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <label className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الملفات…"
            className={cx(FIELD, "w-full pe-9")}
            aria-label="بحث"
          />
        </label>
        {!lockedCategorySlug && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={FIELD} aria-label="الفئة">
            <option value="">كل الفئات</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name_ar}</option>)}
          </select>
        )}
        <select value={product} onChange={(e) => setProduct(e.target.value)} className={FIELD} aria-label="النظام">
          <option value="">كل الأنظمة</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className={FIELD} aria-label="اللغة">
          <option value="">كل اللغات</option>
          <option value="ar">{LANGUAGE_LABEL.ar}</option>
          <option value="en">{LANGUAGE_LABEL.en}</option>
          <option value="both">{LANGUAGE_LABEL.both}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="لا توجد ملفات مطابقة" />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const ext = fileExtBadge(item.file?.ext);
            return (
              <article
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover sm:p-5"
              >
                <span className={cx(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[0.62rem] font-bold text-white",
                  EXT_COLOR[ext] ?? "bg-primary-700",
                )}>
                  {ext}
                </span>
                <div className="min-w-[200px] flex-1">
                  <h3 className="font-bold text-primary-900">{item.title_ar}</h3>
                  {item.description_ar && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description_ar}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    {item.category && <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-medium text-primary-700">{item.category.name_ar}</span>}
                    {item.software_product && <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-medium text-primary-700">{item.software_product.name_ar}</span>}
                    <span>{LANGUAGE_LABEL[item.language]}</span>
                    {item.version && <span>الإصدار {item.version}</span>}
                    {item.release_date && <span>{formatDate(item.release_date)}</span>}
                    {item.file && <span>{formatFileSize(item.file.size)}</span>}
                  </div>
                </div>
                {item.file && (
                  <a
                    href={mediaUrl(item.file.url) ?? "#"}
                    download
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
                  >
                    <Download size={15} /> تحميل
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
