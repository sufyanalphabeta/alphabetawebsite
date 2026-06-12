import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, EmptyState, PageHero } from "~/components/ui";
import type { SuccessStory } from "~/lib/types";

export const Route = createFileRoute("/success-stories")({
  loader: async () => {
    try {
      const res = await getCollection<SuccessStory>("success-stories", {
        "sort[0]": "sort_order:asc",
        "populate[client][populate][0]": "logo",
        "populate[software_product]": "true",
        "populate[gallery]": "true",
        "populate[metrics]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "100",
      });
      return { stories: res.data };
    } catch {
      return { stories: [] };
    }
  },
  component: SuccessStoriesPage,
});

function StoryBlock({ label, labelEn, text }: { label: string; labelEn: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-sm font-bold text-primary-900">
        {label} <span className="ms-1 text-xs font-normal text-slate-300">{labelEn}</span>
      </h3>
      <p className="mt-1.5 text-sm leading-loose text-slate-600">{text}</p>
    </div>
  );
}

function SuccessStoriesPage() {
  const { stories } = Route.useLoaderData();

  useSeo({
    title:       "قصص النجاح | ألفا بيتا",
    description: "قصص نجاح حقيقية لعملاء يعملون بأنظمة ألفا بيتا",
  });

  return (
    <main>
      <PageHero
        title="قصص النجاح"
        titleEn="SUCCESS STORIES"
        subtitle="نتائج حقيقية وقابلة للقياس حققها عملاؤنا بعد التحول إلى أنظمة ألفا بيتا"
      />

      <Container className="max-w-5xl py-14">
        {stories.length === 0 ? (
          <EmptyState message="لا توجد قصص منشورة حالياً" />
        ) : (
          <div className="space-y-10">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden">
                <header className="flex flex-wrap items-center gap-4 bg-hero p-6 text-white">
                  {story.client?.logo && (
                    <img
                      src={mediaUrl(story.client.logo.url) ?? ""}
                      alt={`شعار ${story.client.name_ar}`}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/20"
                    />
                  )}
                  <div className="min-w-[220px] flex-1">
                    <h2 className="text-lg font-bold">{story.title_ar}</h2>
                    <p className="mt-0.5 text-xs text-primary-100/60">
                      {[story.client?.name_ar, story.software_product?.name_ar].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  {story.software_product && (
                    <Link
                      to="/software/$slug"
                      params={{ slug: story.software_product.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      عرض النظام <ArrowLeft size={13} />
                    </Link>
                  )}
                </header>

                <div className="space-y-6 p-7">
                  <StoryBlock label="التحدي"  labelEn="Challenge" text={story.challenge_ar} />
                  <StoryBlock label="الحل"    labelEn="Solution"  text={story.solution_ar} />
                  <StoryBlock label="النتائج" labelEn="Results"   text={story.results_ar} />

                  {(story.metrics?.length ?? 0) > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[...story.metrics!].sort((a, b) => a.sort_order - b.sort_order).map((m) => (
                        <div key={m.id} className="rounded-xl bg-surface p-5 text-center">
                          <p className="text-2xl font-bold text-accent-600">{m.value}</p>
                          <p className="mt-1 text-xs text-slate-500">{m.label_ar}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(story.gallery?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {story.gallery!.map((img) => (
                        <img
                          key={img.id}
                          src={mediaUrl(img.url) ?? ""}
                          alt={img.alternativeText ?? story.title_ar}
                          className="h-28 w-48 rounded-xl border border-slate-200 object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
