import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Container, PageHero } from "~/components/ui";
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
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary-800">الفئة غير موجودة</h1>
      <Link to="/downloads" className="mt-4 inline-block font-semibold text-accent-600">← العودة إلى مركز التحميلات</Link>
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
    <main>
      <PageHero title={category.name_ar} titleEn={category.name_en ?? undefined}>
        <nav className="mt-4 flex items-center gap-2 text-sm text-primary-100/60">
          <Link to="/downloads" className="hover:text-white">مركز التحميلات</Link>
          <span>/</span>
          <span className="text-primary-100">{category.name_ar}</span>
        </nav>
      </PageHero>

      <Container className="max-w-5xl py-12">
        <DownloadCenter items={items} lockedCategorySlug={category.slug} />
      </Container>
    </main>
  );
}
