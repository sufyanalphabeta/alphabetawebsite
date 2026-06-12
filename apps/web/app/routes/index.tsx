import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MonitorCheck, ShieldCheck, Headset } from "lucide-react";
import { getCollection, getSingle, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import {
  Badge,
  BrandWatermark,
  Card,
  Container,
  CountUp,
  EmptyState,
  LinkButton,
  Marquee,
  Reveal,
  Section,
  SectionHeading,
  Stars,
  StatTile,
} from "~/components/ui";
import { DashboardMockup } from "~/components/DashboardMockup";
import type {
  Client,
  Partner,
  Service,
  SiteSetting,
  SoftwareProduct,
  Testimonial,
} from "~/lib/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const safe = async <T,>(p: Promise<{ data: T[] }>): Promise<T[]> => {
      try { return (await p).data; } catch { return []; }
    };
    const [setting, products, clients, testimonials, partners, services] = await Promise.all([
      getSingle<SiteSetting>("site-setting", { locale: "ar" }).then((r) => r.data).catch(() => null),
      safe(getCollection<SoftwareProduct>("software-products", {
        "sort[0]": "sort_order:asc",
        "populate[logo]": "true",
        "populate[category]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "6",
      })),
      safe(getCollection<Client>("clients", {
        "sort[0]": "sort_order:asc",
        "populate[logo]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "12",
      })),
      safe(getCollection<Testimonial>("testimonials", {
        "sort[0]": "sort_order:asc",
        "populate[image]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "3",
      })),
      safe(getCollection<Partner>("partners", {
        "sort[0]": "sort_order:asc",
        "populate[logo]": "true",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "8",
      })),
      safe(getCollection<Service>("services", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
        "pagination[pageSize]": "4",
      })),
    ]);
    return { setting, products, clients, testimonials, partners, services };
  },
  component: HomePage,
});

const TRUST_POINTS = [
  { icon: MonitorCheck, label: "أنظمة عربية أولاً" },
  { icon: ShieldCheck,  label: "أمان وموثوقية مؤسسية" },
  { icon: Headset,      label: "دعم فني محلي متواصل" },
];

function HomePage() {
  const { setting, products, clients, testimonials, partners, services } = Route.useLoaderData();

  useSeo({
    title:       `${setting?.site_name_ar ?? "ألفا بيتا"} | أنظمة برمجية للمؤسسات`,
    description: setting?.tagline_ar ?? "شركة ليبية متخصصة في تطوير الأنظمة البرمجية للمؤسسات",
  });

  const featured = products.filter((p) => p.is_featured).slice(0, 3);
  const heroProducts = (featured.length > 0 ? featured : products).slice(0, 3);

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-mesh relative overflow-hidden text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <BrandWatermark className="-start-24 -bottom-40 h-[28rem] w-[28rem] opacity-[0.05]" />
        <Container className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2">
          <div className="animate-fade-up">
            <Badge tone="darkGlass" className="mb-5 ring-1 ring-white/15">
              <span className="me-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              منصة ألفا بيتا للأنظمة المؤسسية
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.15] sm:text-[3.4rem]">
              {setting?.tagline_ar ?? "نصنع البرمجيات، نبني المستقبل"}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-heroink-100/85">
              أنظمة متكاملة للتأمين والرعاية الصحية وتخطيط موارد المؤسسات — مصممة للسوق الليبي،
              بمعايير عالمية وبدعم عربي كامل.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton to="/request-demo" variant="accent" size="lg" className="shadow-lg shadow-accent-500/25">
                اطلب عرضاً توضيحياً
              </LinkButton>
              <LinkButton to="/software" variant="ghostDark" size="lg" className="glass border-0">
                استعرض الأنظمة
              </LinkButton>
            </div>
            <ul className="mt-11 flex flex-wrap gap-x-7 gap-y-3">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-heroink-100/80">
                  <Icon size={16} className="text-royal-400" /> {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Hero dashboard mockup */}
          <div className="relative hidden lg:block">
            <div className="glass animate-float rounded-3xl p-3">
              <DashboardMockup />
            </div>
            {/* floating product chips */}
            <div className="absolute -start-6 -bottom-6 space-y-2">
              {heroProducts.slice(0, 2).map((p) => (
                <Link
                  key={p.id}
                  to="/software/$slug"
                  params={{ slug: p.slug }}
                  className="glass flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-white/15"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15">
                    {p.logo ? (
                      <img src={mediaUrl(p.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <MonitorCheck size={15} className="text-white" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-white">{p.name_ar}</span>
                  <ArrowLeft size={13} className="text-royal-400" />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Client logo marquee ───────────────────────────── */}
      {clients.length > 0 && (
        <section className="border-b border-slate-100 bg-card py-10">
          <Container>
            <p className="mb-7 text-center text-sm font-medium text-slate-400">
              مؤسسات رائدة تدير أعمالها بأنظمة ألفا بيتا
            </p>
            <Marquee>
              {clients.map((c) => (
                <Link key={c.id} to="/clients" title={c.name_ar} className="flex shrink-0 items-center gap-2.5 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
                  {c.logo && (
                    <img src={mediaUrl(c.logo.url) ?? ""} alt={c.name_ar} className="h-10 w-10 rounded-lg object-cover" />
                  )}
                  <span className="whitespace-nowrap text-sm font-semibold text-slate-600">{c.name_ar}</span>
                </Link>
              ))}
            </Marquee>
          </Container>
        </section>
      )}

      {/* ── Animated stats band ───────────────────────────── */}
      <Section tone="muted" className="py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-royal-500 sm:text-4xl"><CountUp end={10} prefix="+" /></p>
            <p className="mt-1 text-sm text-slate-500">سنوات خبرة</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-royal-500 sm:text-4xl"><CountUp end={50} prefix="+" /></p>
            <p className="mt-1 text-sm text-slate-500">مؤسسة تثق بنا</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-royal-500 sm:text-4xl"><CountUp end={products.length || 6} suffix="+" /></p>
            <p className="mt-1 text-sm text-slate-500">أنظمة متكاملة</p>
          </div>
          <StatTile value="24/7" label="دعم فني متواصل" />
        </div>
      </Section>

      {/* ── Featured products ─────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="منظومة البرمجيات"
          title="أنظمة تدير مؤسستك من طرف إلى طرف"
          description="حلول جاهزة قابلة للتخصيص تغطي قطاعات التأمين والرعاية الصحية والمالية والموارد البشرية"
        />
        {products.length === 0 ? (
          <EmptyState message="لا توجد أنظمة منشورة حالياً" />
        ) : (
          <Reveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <Link key={p.id} to="/software/$slug" params={{ slug: p.slug }} className="group">
                <Card className="flex h-full flex-col p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
                      {p.logo ? (
                        <img src={mediaUrl(p.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <MonitorCheck size={22} className="text-primary-600" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-primary-900">{p.name_ar}</h3>
                      {p.category && <p className="text-xs text-slate-400">{p.category.name_ar}</p>}
                    </div>
                    {p.is_featured && <Badge tone="accent" className="ms-auto shrink-0">مميز</Badge>}
                  </div>
                  {p.short_description_ar && (
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">{p.short_description_ar}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-500 transition-transform group-hover:-translate-x-1">
                    عرض التفاصيل <ArrowLeft size={15} />
                  </span>
                </Card>
              </Link>
            ))}
          </Reveal>
        )}
        <div className="mt-10 text-center">
          <LinkButton to="/software" variant="outline" size="md">جميع الأنظمة</LinkButton>
        </div>
      </Section>

      {/* ── Services strip ────────────────────────────────── */}
      {services.length > 0 && (
        <Section tone="muted">
          <SectionHeading
            eyebrow="خدماتنا"
            title="أكثر من مجرد برمجيات"
            description="نرافقك من التخطيط حتى التشغيل: تطوير مخصص، تحول رقمي، تدريب، ودعم مستمر"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Card key={s.id} className="p-6">
                <CheckCircle2 size={22} className="text-royal-500" />
                <h3 className="mt-3 font-bold text-primary-900">{s.name_ar}</h3>
                {s.description_ar && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description_ar}</p>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* ── Testimonials ──────────────────────────────────── */}
      {testimonials.length > 0 && (
        <Section>
          <SectionHeading eyebrow="آراء العملاء" title="ماذا يقول من يعمل بأنظمتنا يومياً؟" />
          <Reveal className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="flex flex-col p-6">
                <Stars rating={t.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  "{t.text_ar}"
                </blockquote>
                <footer className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  {t.image && (
                    <img src={mediaUrl(t.image.url) ?? ""} alt="" className="h-10 w-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-primary-900">{t.customer_name_ar}</p>
                    <p className="text-xs text-slate-400">
                      {[t.position_ar, t.company_ar].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                </footer>
              </Card>
            ))}
          </Reveal>
          <div className="mt-8 text-center">
            <Link to="/testimonials" className="text-sm font-semibold text-royal-500 hover:text-royal-600">
              جميع آراء العملاء ←
            </Link>
          </div>
        </Section>
      )}

      {/* ── Partners strip ────────────────────────────────── */}
      {partners.length > 0 && (
        <Section tone="muted" className="py-12">
          <p className="mb-6 text-center text-sm font-medium text-slate-400">شركاؤنا في النجاح</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {partners.map((p) => (
              <Link key={p.id} to="/partners" className="flex items-center gap-2.5 opacity-70 transition hover:opacity-100">
                {p.logo && (
                  <img src={mediaUrl(p.logo.url) ?? ""} alt={p.name_ar} className="h-8 w-8 rounded-md object-cover" />
                )}
                <span className="text-sm font-semibold text-slate-600" dir="ltr">{p.name_en ?? p.name_ar}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="bg-cta py-16 text-white sm:py-20">
        <Container className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">جاهز لتحويل مؤسستك رقمياً؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-heroink-100/80">
            تحدث مع فريقنا اليوم واحصل على عرض توضيحي مباشر لأي نظام، أو عرض سعر مخصص لاحتياجك.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton to="/request-demo" variant="accent" size="lg">اطلب عرضاً توضيحياً</LinkButton>
            <LinkButton to="/request-quote" variant="white" size="lg">اطلب عرض سعر</LinkButton>
            <LinkButton to="/contact" variant="ghostDark" size="lg">تواصل مع المبيعات</LinkButton>
          </div>
        </Container>
      </section>
    </main>
  );
}
