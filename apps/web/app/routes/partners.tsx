import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Handshake } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Badge, Card, Container, EmptyState, PageHero, SectionHeading } from "~/components/ui";
import type { Partner, PartnerType } from "~/lib/types";

export const Route = createFileRoute("/partners")({
  loader: async () => {
    try {
      const [partnersRes, typesRes] = await Promise.all([
        getCollection<Partner>("partners", {
          "sort[0]": "sort_order:asc",
          "populate[logo]": "true",
          "populate[partner_type]": "true",
          "filters[publishedAt][$notNull]": "true",
          "pagination[pageSize]": "100",
        }),
        getCollection<PartnerType>("partner-types", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
      ]);
      return { partners: partnersRes.data, types: typesRes.data };
    } catch {
      return { partners: [], types: [] };
    }
  },
  component: PartnersPage,
});

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
          {partner.logo ? (
            <img src={mediaUrl(partner.logo.url) ?? ""} alt={`شعار ${partner.name_ar}`} className="h-full w-full object-cover" />
          ) : (
            <Handshake size={22} className="text-primary-600" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-primary-900">{partner.name_ar}</h3>
          {partner.name_en && (
            <p dir="ltr" className="truncate text-start text-xs text-slate-400">{partner.name_en}</p>
          )}
        </div>
        {partner.partner_type && (
          <Badge tone="primary" className="ms-auto shrink-0">{partner.partner_type.name_ar}</Badge>
        )}
      </div>
      {partner.description_ar && (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">{partner.description_ar}</p>
      )}
      {partner.website && (
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="mt-4 inline-flex items-center gap-1.5 self-end text-sm font-semibold text-royal-500 hover:text-royal-600"
        >
          {partner.website.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink size={13} />
        </a>
      )}
    </Card>
  );
}

function PartnersPage() {
  const { partners, types } = Route.useLoaderData();

  useSeo({
    title:       "شركاؤنا | ألفا بيتا",
    description: "شركاء ألفا بيتا التقنيون والاستراتيجيون",
  });

  const ungrouped = partners.filter((p) => !p.partner_type);

  return (
    <main>
      <PageHero
        title="شركاؤنا"
        titleEn="OUR PARTNERS"
        subtitle="نبني مع كبرى الشركات التقنية العالمية شراكات تضمن لعملائنا أحدث التقنيات وأفضل بنية تحتية"
      />

      <Container className="py-14">
        {partners.length === 0 ? (
          <EmptyState message="لا يوجد شركاء منشورون حالياً" />
        ) : (
          <>
            {types.map((type) => {
              const items = partners.filter((p) => p.partner_type?.id === type.id);
              if (items.length === 0) return null;
              return (
                <section key={type.id} className="mb-12 last:mb-0">
                  <SectionHeading align="start" eyebrow={type.name_en ?? undefined} title={type.name_ar} />
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </section>
              );
            })}
            {ungrouped.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {ungrouped.map((p) => <PartnerCard key={p.id} partner={p} />)}
              </div>
            )}
          </>
        )}
      </Container>
    </main>
  );
}
