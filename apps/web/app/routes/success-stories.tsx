import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Lightbulb, TrendingUp } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, cx, EmptyState, PageHero } from "~/components/ui";
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

const TIMELINE_STEPS = [
  { key: "challenge" as const, label: "التحدي",  labelEn: "Challenge", icon: AlertTriangle, tone: "text-amber-500 bg-amber-500/10" },
  { key: "solution"  as const, label: "الحل",    labelEn: "Solution",  icon: Lightbulb,     tone: "text-royal-500 bg-royal-500/10" },
  { key: "results"   as const, label: "النتائج", labelEn: "Results",   icon: TrendingUp,    tone: "text-emerald-600 bg-emerald-600/10" },
];

/** Challenge → Solution → Results as a connected timeline. */
function StoryTimeline({ story }: { story: SuccessStory }) {
  const texts = {
    challenge: story.challenge_ar,
    solution:  story.solution_ar,
    results:   story.results_ar,
  };
  const steps = TIMELINE_STEPS.filter((s) => texts[s.key]);
  if (steps.length === 0) return null;

  return (
    <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
      {/* connector (desktop) */}
      <div className="absolute inset-x-12 top-6 hidden border-t-2 border-dashed border-slate-200 md:block" />
      {steps.map(({ key, label, labelEn, icon: Icon, tone }, i) => (
        <div key={key} className="relative">
          <div className="flex items-center gap-3 md:flex-col md:items-start">
            <span className={cx("relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-card", tone)}>
              <Icon size={20} />
            </span>
            <div>
              <p className="font-bold text-primary-900">
                {label}
                <span className="ms-2 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-300">{labelEn}</span>
              </p>
              <p className="text-[0.65rem] font-semibold text-slate-300">المرحلة {i + 1} من {steps.length}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-loose text-slate-600">{texts[key]}</p>
        </div>
      ))}
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
                    <p className="mt-0.5 text-xs text-heroink-100/60">
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

                <div className="space-y-7 p-7">
                  <StoryTimeline story={story} />

                  {(story.metrics?.length ?? 0) > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[...story.metrics!].sort((a, b) => a.sort_order - b.sort_order).map((m) => (
                        <div key={m.id} className="rounded-xl bg-surface p-5 text-center">
                          <p className="text-2xl font-bold text-royal-500">{m.value}</p>
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
