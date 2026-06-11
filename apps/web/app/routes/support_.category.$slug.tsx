import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { SupportArticles } from "~/components/SupportArticles";
import type { SupportArticle, SupportCategory } from "~/lib/types";

export const Route = createFileRoute("/support_/category/$slug")({
  loader: async ({ params }) => {
    const catRes = await getCollection<SupportCategory>("support-categories", {
      "filters[slug][$eq]": params.slug,
    });
    const category = catRes.data[0];
    if (!category) throw notFound();
    const articlesRes = await getCollection<SupportArticle>("support-articles", {
      "sort[0]": "sort_order:asc",
      "populate[category]": "true",
      "populate[software_product]": "true",
      "filters[category][slug][$eq]": params.slug,
      "filters[publishedAt][$notNull]": "true",
      "pagination[pageSize]": "100",
    });
    return { category, articles: articlesRes.data };
  },
  notFoundComponent: () => (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ color: "#0f3460" }}>القسم غير موجود</h1>
      <Link to="/support" style={{ color: "#e94560" }}>← العودة إلى مركز الدعم</Link>
    </main>
  ),
  component: SupportCategoryPage,
});

function SupportCategoryPage() {
  const { category, articles } = Route.useLoaderData();

  useSeo({
    title:       `${category.name_ar} | مركز الدعم | ألفا بيتا`,
    description: category.description_ar ?? `مقالات ${category.name_ar}`,
  });

  return (
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <nav style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <Link to="/support" style={{ color: "#888", textDecoration: "none" }}>مركز الدعم</Link>
        <span style={{ color: "#ccc", margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "#0f3460" }}>{category.name_ar}</span>
      </nav>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.9rem", color: "#0f3460", margin: 0 }}>{category.name_ar}</h1>
        {category.description_ar && <p style={{ color: "#888", margin: "0.4rem 0 0" }}>{category.description_ar}</p>}
      </header>
      <SupportArticles articles={articles} lockedCategorySlug={category.slug} />
    </main>
  );
}
