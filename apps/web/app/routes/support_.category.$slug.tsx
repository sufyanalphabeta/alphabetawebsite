import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Container, PageHero } from "~/components/ui";
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
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary-800">القسم غير موجود</h1>
      <Link to="/support" className="mt-4 inline-block font-semibold text-accent-600">← العودة إلى مركز الدعم</Link>
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
    <main>
      <PageHero title={category.name_ar} titleEn={category.name_en ?? undefined} subtitle={category.description_ar ?? undefined}>
        <nav className="mt-4 flex items-center gap-2 text-sm text-primary-100/60">
          <Link to="/support" className="hover:text-white">مركز الدعم</Link>
          <span>/</span>
          <span className="text-primary-100">{category.name_ar}</span>
        </nav>
      </PageHero>

      <Container className="max-w-5xl py-12">
        <SupportArticles articles={articles} lockedCategorySlug={category.slug} />
      </Container>
    </main>
  );
}
