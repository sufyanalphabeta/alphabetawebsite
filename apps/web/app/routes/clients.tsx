import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Badge, Card, Container, EmptyState, PageHero, SectionHeading } from "~/components/ui";
import { LibyaMap } from "~/components/LibyaMap";
import type { Client } from "~/lib/types";

export const Route = createFileRoute("/clients")({
  loader: async () => {
    try {
      const res = await getCollection<Client>("clients", {
        "sort[0]": "sort_order:asc",
        "populate[logo]": "true",
        "populate[industry]": "true",
        "populate[software_products]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "100",
      });
      return { clients: res.data };
    } catch {
      return { clients: [] };
    }
  },
  component: ClientsPage,
});

function ClientsPage() {
  const { clients } = Route.useLoaderData();

  useSeo({
    title:       "عملاؤنا | ألفا بيتا",
    description: "مؤسسات وشركات تثق في أنظمة ألفا بيتا البرمجية",
  });

  return (
    <main>
      <PageHero
        title="عملاؤنا"
        titleEn="OUR CLIENTS"
        subtitle="مؤسسات رائدة في التأمين والرعاية الصحية والقطاع غير الربحي تدير أعمالها اليومية بأنظمة ألفا بيتا"
      />

      {/* Logo wall */}
      {clients.length > 0 && (
        <section className="border-b border-slate-100 bg-card py-10">
          <Container className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {clients.map((c) => (
              <span key={c.id} className="flex items-center gap-2.5 opacity-80">
                {c.logo ? (
                  <img src={mediaUrl(c.logo.url) ?? ""} alt={c.name_ar} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <Building2 size={22} className="text-heroink-300" />
                )}
                <span className="font-semibold text-slate-600">{c.name_ar}</span>
              </span>
            ))}
          </Container>
        </section>
      )}

      {/* Coverage map */}
      <section className="bg-surface py-16">
        <Container>
          <SectionHeading
            eyebrow="Coverage"
            title="حضور يغطي ليبيا"
            description="ندعم عملاءنا ميدانياً في المدن الرئيسية، مع إمكانية النشر السحابي في أي مكان"
          />
          <LibyaMap />
        </Container>
      </section>

      <Container className="py-14">
        {clients.length === 0 ? (
          <EmptyState message="لا يوجد عملاء منشورون حالياً" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id} className="flex flex-col p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
                    {client.logo ? (
                      <img src={mediaUrl(client.logo.url) ?? ""} alt={`شعار ${client.name_ar}`} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={22} className="text-primary-600" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-bold text-primary-900">{client.name_ar}</h2>
                    {client.name_en && (
                      <p dir="ltr" className="truncate text-start text-xs text-slate-400">{client.name_en}</p>
                    )}
                  </div>
                  {client.is_featured && <Badge tone="accent" className="ms-auto shrink-0">مميز</Badge>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {client.industry && <Badge tone="primary">{client.industry.name_ar}</Badge>}
                  {client.country_ar && (
                    <Badge tone="neutral"><MapPin size={11} /> {client.country_ar}</Badge>
                  )}
                </div>

                {client.description_ar && (
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">{client.description_ar}</p>
                )}

                {(client.software_products?.length ?? 0) > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-400">الأنظمة المستخدمة</p>
                    <div className="flex flex-wrap gap-2">
                      {client.software_products!.map((p) => (
                        <Link
                          key={p.id}
                          to="/software/$slug"
                          params={{ slug: p.slug }}
                          className="rounded-full border border-royal-500/40 px-3 py-1 text-xs font-medium text-royal-500 transition-colors hover:bg-royal-500/10"
                        >
                          {p.name_ar}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
