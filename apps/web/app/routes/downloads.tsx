import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Container, PageHero } from "~/components/ui";
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
    <main>
      <PageHero
        title="مركز التحميلات"
        titleEn="DOWNLOADS CENTER"
        subtitle="بروشورات، أدلة مستخدم، عروض تقديمية، وأدوات — كل ملفات الأنظمة في مكان واحد"
      >
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/downloads/category/$slug"
                params={{ slug: cat.slug }}
                className="rounded-full border border-white/25 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
              >
                {cat.name_ar}
              </Link>
            ))}
          </div>
        )}
      </PageHero>

      <Container className="max-w-5xl py-12">
        <DownloadCenter items={items} />
      </Container>
    </main>
  );
}
