import { createFileRoute } from "@tanstack/react-router";
import { Factory } from "lucide-react";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, EmptyState, PageHero } from "~/components/ui";
import type { Industry } from "~/lib/types";

export const Route = createFileRoute("/industries")({
  loader: async () => {
    try {
      const res = await getCollection<Industry>("industries", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
      });
      return { industries: res.data };
    } catch {
      return { industries: [] };
    }
  },
  component: IndustriesPage,
});

function IndustriesPage() {
  const { industries } = Route.useLoaderData();

  useSeo({
    title:       "القطاعات | ألفا بيتا",
    description: "القطاعات التي تخدمها أنظمة ألفا بيتا: التأمين، الصحة، التعليم، الحكومة، والمزيد",
  });

  return (
    <main>
      <PageHero
        title="القطاعات التي نخدمها"
        titleEn="INDUSTRIES"
        subtitle="خبرة عملية متراكمة في قطاعات متنوعة تنعكس مباشرة في تصميم أنظمتنا"
      />

      <Container className="py-14">
        {industries.length === 0 ? (
          <EmptyState message="لا توجد قطاعات منشورة حالياً" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <Card key={industry.id} className="p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Factory size={22} className="text-primary-600" />
                </span>
                <h2 className="mt-3 font-bold text-primary-900">{industry.name_ar}</h2>
                {industry.name_en && (
                  <p dir="ltr" className="text-xs text-slate-400">{industry.name_en}</p>
                )}
                {industry.description_ar && (
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{industry.description_ar}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
