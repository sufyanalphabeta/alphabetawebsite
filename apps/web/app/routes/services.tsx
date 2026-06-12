import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Badge, Card, Container, EmptyState, LinkButton, PageHero } from "~/components/ui";
import type { Service } from "~/lib/types";

export const Route = createFileRoute("/services")({
  loader: async () => {
    try {
      const res = await getCollection<Service>("services", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
      });
      return { services: res.data };
    } catch {
      return { services: [] };
    }
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = Route.useLoaderData();

  useSeo({
    title:       "خدماتنا | ألفا بيتا",
    description: "تطوير برمجيات مخصصة، تحول رقمي، دعم فني، وتدريب — خدمات ألفا بيتا",
  });

  return (
    <main>
      <PageHero
        title="خدماتنا"
        titleEn="OUR SERVICES"
        subtitle="من التطوير المخصص إلى التدريب والدعم المستمر — نرافقك في كل مرحلة من رحلتك الرقمية"
      />

      <Container className="py-14">
        {services.length === 0 ? (
          <EmptyState message="لا توجد خدمات منشورة حالياً" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id} className="p-7">
                <div className="flex items-start justify-between gap-3">
                  <CheckCircle2 size={24} className="text-royal-500" />
                  {service.is_featured && <Badge tone="accent">خدمة رئيسية</Badge>}
                </div>
                <h2 className="mt-3 text-xl font-bold text-primary-900">{service.name_ar}</h2>
                {service.name_en && (
                  <p dir="ltr" className="mt-0.5 text-start text-xs text-slate-400">{service.name_en}</p>
                )}
                {service.description_ar && (
                  <p className="mt-3 leading-loose text-slate-600">{service.description_ar}</p>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-cta p-10 text-center text-white">
          <h2 className="text-2xl font-bold">عندك مشروع في بالك؟</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-heroink-100/80">
            احكِ لنا عن فكرتك وسنقترح عليك المسار التقني الأنسب وخطة تنفيذ واضحة.
          </p>
          <LinkButton to="/contact" variant="accent" className="mt-6">تواصل معنا</LinkButton>
        </div>
      </Container>
    </main>
  );
}
