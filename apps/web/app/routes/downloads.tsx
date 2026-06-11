import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { DownloadCenter } from "~/components/DownloadCenter";
import type { DownloadCategory, DownloadCenterItem } from "~/lib/types";

export const Route = createFileRoute("/downloads")({
  loader: async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        getCollection<DownloadCategory>("download-categories", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
        getCollection<DownloadCenterItem>("download-items", {
          "sort[0]": "sort_order:asc",
          "populate[file]": "true",
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
  component: DownloadsPage,
});

function DownloadsPage() {
  const { categories, items } = Route.useLoaderData();

  useSeo({
    title:       "مركز التحميلات | ألفا بيتا",
    description: "بروشورات وأدلة مستخدم وعروض تقديمية وأدوات لأنظمة ألفا بيتا",
  });

  return (
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>مركز التحميلات</h1>
        <p style={{ color: "#888" }}>Downloads Center</p>
      </header>

      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to="/downloads/category/$slug" params={{ slug: cat.slug }}
            style={{
              fontSize: "0.85rem", color: "#0f3460", textDecoration: "none",
              border: "1px solid #d8dde6", padding: "0.45rem 1.1rem", borderRadius: 999, background: "#fff",
            }}
          >
            {cat.name_ar}
          </Link>
        ))}
      </div>

      <DownloadCenter items={items} />
    </main>
  );
}
