import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { DownloadCenter } from "~/components/DownloadCenter";
import type { DownloadCategory, DownloadCenterItem } from "~/lib/types";

export const Route = createFileRoute("/downloads_/category/$slug")({
  loader: async ({ params }) => {
    const catRes = await getCollection<DownloadCategory>("download-categories", {
      "filters[slug][$eq]": params.slug,
    });
    const category = catRes.data[0];
    if (!category) throw notFound();
    const itemsRes = await getCollection<DownloadCenterItem>("download-items", {
      "sort[0]": "sort_order:asc",
      "populate[file]": "true",
      "populate[category]": "true",
      "populate[software_product]": "true",
      "filters[category][slug][$eq]": params.slug,
      "filters[publishedAt][$notNull]": "true",
      "pagination[pageSize]": "100",
    });
    return { category, items: itemsRes.data };
  },
  notFoundComponent: () => (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ color: "#0f3460" }}>الفئة غير موجودة</h1>
      <Link to="/downloads" style={{ color: "#e94560" }}>← العودة إلى مركز التحميلات</Link>
    </main>
  ),
  component: DownloadsCategoryPage,
});

function DownloadsCategoryPage() {
  const { category, items } = Route.useLoaderData();

  useSeo({
    title:       `${category.name_ar} | مركز التحميلات | ألفا بيتا`,
    description: `تحميل ملفات ${category.name_ar} لأنظمة ألفا بيتا`,
  });

  return (
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <nav style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <Link to="/downloads" style={{ color: "#888", textDecoration: "none" }}>مركز التحميلات</Link>
        <span style={{ color: "#ccc", margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#0f3460" }}>{category.name_ar}</span>
      </nav>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.9rem", color: "#0f3460", margin: 0 }}>{category.name_ar}</h1>
      </header>
      <DownloadCenter items={items} lockedCategorySlug={category.slug} />
    </main>
  );
}
