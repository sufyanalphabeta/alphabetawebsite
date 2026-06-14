import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, EmptyState, PageHero, Stars } from "~/components/ui";
import type { Testimonial } from "~/lib/types";

export const Route = createFileRoute("/testimonials")({
  loader: async () => {
    try {
      const res = await getCollection<Testimonial>("testimonials", {
        "sort[0]": "sort_order:asc",
        "populate[image]": "true",
        "populate[client]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "100",
      });
      return { testimonials: res.data };
    } catch {
      return { testimonials: [] as Testimonial[] };
    }
  },
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { testimonials } = Route.useLoaderData();

  useSeo({
    title:       "آراء العملاء | ألفا بيتا",
    description: "ماذا يقول عملاؤنا عن أنظمة ألفا بيتا",
  });

  return (
    <main>
      <PageHero
        title="آراء العملاء"
        titleEn="TESTIMONIALS"
        subtitle="شهادات حقيقية من مدراء ومسؤولين يعملون بأنظمتنا يومياً"
      />

      <Container className="py-14">
        {testimonials.length === 0 ? (
          <EmptyState message="لا توجد آراء منشورة حالياً" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="flex flex-col p-7">
                <div className="flex items-center justify-between">
                  <Stars rating={t.rating} />
                  <Quote size={26} className="text-heroink-100" />
                </div>
                <blockquote className="mt-4 flex-1 leading-loose text-slate-600">
                  "{t.text_ar}"
                </blockquote>
                <footer className="mt-6 flex items-center gap-3.5 border-t border-slate-100 pt-5">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
                    {t.image && (
                      <img src={mediaUrl(t.image.url) ?? ""} alt={t.customer_name_ar} className="h-full w-full object-cover" />
                    )}
                  </span>
                  <div>
                    <p className="font-bold text-primary-900">{t.customer_name_ar}</p>
                    <p className="text-xs text-slate-400">
                      {[t.position_ar, t.company_ar ?? t.client?.name_ar].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                </footer>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
