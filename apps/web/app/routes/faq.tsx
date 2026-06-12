import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Container, cx, EmptyState, PageHero } from "~/components/ui";
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

const FIELD =
  "rounded-lg border border-slate-200 bg-card px-3.5 py-2.5 text-sm text-slate-700 focus:border-primary-400 focus:outline-none";

function FaqEntry({ item }: { item: FaqItem }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-card shadow-card">
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-5">
        <span className="font-bold text-primary-900">
          {item.question_ar}
          {item.software_product && (
            <span className="ms-2 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {item.software_product.name_ar}
            </span>
          )}
        </span>
        <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      {item.answer_ar && (
        <p className="border-t border-slate-100 p-5 pt-4 text-sm leading-loose text-slate-600">{item.answer_ar}</p>
      )}
    </details>
  );
}

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

  const uncategorized = filtered.filter((i) => !i.category);

  return (
    <main>
      <PageHero
        title="الأسئلة الشائعة"
        titleEn="FAQ CENTER"
        subtitle="إجابات مباشرة لأكثر الأسئلة تكراراً حول أنظمتنا وخدماتنا وطرق الترخيص"
      />

      <Container className="max-w-4xl py-12">
        <div className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-card">
          <label className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الأسئلة…"
              className={cx(FIELD, "w-full pe-9")}
              aria-label="بحث"
            />
          </label>
          <select value={product} onChange={(e) => setProduct(e.target.value)} className={FIELD} aria-label="النظام">
            <option value="">كل الأنظمة</option>
            {products.map((p) => <option key={p.slug} value={p.slug}>{p.name_ar}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="لا توجد أسئلة مطابقة" />
        ) : (
          <>
            {categories.map((cat) => {
              const catItems = filtered.filter((i) => i.category?.id === cat.id);
              if (catItems.length === 0) return null;
              return (
                <section key={cat.id} className="mb-9">
                  <h2 className="mb-4 text-xl font-bold text-primary-900">
                    {cat.name_ar}
                    {cat.name_en && <span className="ms-2 text-xs font-normal tracking-wide text-slate-300">{cat.name_en}</span>}
                  </h2>
                  <div className="space-y-3">
                    {catItems.map((item) => <FaqEntry key={item.id} item={item} />)}
                  </div>
                </section>
              );
            })}
            {uncategorized.length > 0 && (
              <div className="space-y-3">
                {uncategorized.map((item) => <FaqEntry key={item.id} item={item} />)}
              </div>
            )}
          </>
        )}

        <p className="mt-10 text-center text-sm text-slate-400">
          لم تجد إجابتك؟{" "}
          <Link to="/contact" className="font-semibold text-royal-500 hover:text-royal-600">تواصل معنا</Link>
          {" "}أو تصفح{" "}
          <Link to="/support" className="font-semibold text-royal-500 hover:text-royal-600">مركز الدعم</Link>
        </p>
      </Container>
    </main>
  );
}
