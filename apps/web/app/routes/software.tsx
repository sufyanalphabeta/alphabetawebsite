import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MonitorCheck } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Badge, Card, Container, cx, EmptyState, LinkButton } from "~/components/ui";
import type { SoftwareProduct } from "~/lib/types";

export const Route = createFileRoute("/software")({
  loader: async () => {
    try {
      const res = await getCollection<SoftwareProduct>("software-products", {
        "sort[0]":    "sort_order:asc",
        "populate[logo]": "true",
        "populate[category]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "50",
      });
      return { products: res.data };
    } catch {
      return { products: [] };
    }
  },
  component: SoftwarePage,
});

function ProductCard({ product }: { product: SoftwareProduct }) {
  return (
    <Link to="/software/$slug" params={{ slug: product.slug }} className="group">
      <Card className={cx("flex h-full flex-col p-6", product.is_featured && "ring-1 ring-accent-200")}>
        <div className="flex items-start gap-4">
          <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
            {product.logo ? (
              <img src={mediaUrl(product.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
            ) : (
              <MonitorCheck size={24} className="text-primary-600" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold leading-snug text-primary-900">{product.name_ar}</h2>
            {product.name_en && (
              <p dir="ltr" className="truncate text-start text-xs text-slate-400">{product.name_en}</p>
            )}
          </div>
          {product.is_featured && <Badge tone="accent" className="shrink-0">مميز</Badge>}
        </div>

        {product.short_description_ar && (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">{product.short_description_ar}</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          {product.category ? (
            <Badge tone="primary">{product.category.name_ar}</Badge>
          ) : <span />}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-transform group-hover:-translate-x-1">
            عرض التفاصيل <ArrowLeft size={15} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function SoftwarePage() {
  const { products } = Route.useLoaderData();
  const [category, setCategory] = useState("");

  useSeo({
    title:       "منظومة البرمجيات | ألفا بيتا",
    description: "استعرض أنظمة ألفا بيتا المتكاملة: التأمين، الطبي، ERP، الموارد البشرية والمزيد",
  });

  const categories = useMemo(
    () => [...new Map(products.filter((p) => p.category).map((p) => [p.category!.slug, p.category!])).values()],
    [products],
  );
  const filtered = category ? products.filter((p) => p.category?.slug === category) : products;

  return (
    <main>
      {/* Page hero */}
      <section className="bg-hero py-14 text-white sm:py-16">
        <Container>
          <h1 className="text-3xl font-bold sm:text-4xl">منظومة البرمجيات</h1>
          <p className="mt-3 max-w-2xl text-primary-100/80">
            أنظمة مؤسسية متكاملة، عربية أولاً، قابلة للتخصيص — صممت لتدير أعمالك من طرف إلى طرف.
          </p>
        </Container>
      </section>

      <Container className="py-12">
        {/* Category filter bar */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === ""
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary-300",
              )}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === c.slug
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary-300",
                )}
              >
                {c.name_ar}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState message="لا توجد أنظمة مطابقة" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-cta px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">لم تجد ما يناسب احتياجك بالضبط؟</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-100/80">
            نطوّر حلولاً مخصصة بالكامل — أخبرنا عن متطلباتك وسنقترح المسار الأنسب.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to="/request-demo" variant="accent">اطلب عرضاً توضيحياً</LinkButton>
            <LinkButton to="/contact" variant="ghostDark">تواصل معنا</LinkButton>
          </div>
        </div>
      </Container>
    </main>
  );
}
