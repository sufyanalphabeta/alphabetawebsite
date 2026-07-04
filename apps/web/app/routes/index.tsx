import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Headset,
  HeartPulse,
  Landmark,
  MonitorCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getCollection, getSingle, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import {
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
  cx,
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

/* ── Static content (not from CMS) ──────────────────────────── */
const SECTORS = [
  { icon: ShieldCheck,  label: "التأمين" },
  { icon: HeartPulse,   label: "الرعاية الصحية" },
  { icon: Building2,    label: "ERP" },
  { icon: ShoppingCart, label: "نقاط البيع" },
  { icon: Users,        label: "الموارد البشرية" },
  { icon: Landmark,     label: "القطاع الحكومي" },
] as const;

const WHY_US = [
  {
    icon: Globe,
    title: "عربية أولاً",
    desc:  "واجهات عربية أصيلة مع دعم كامل لمتطلبات السوق الليبي والمعايير المحلية.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "أمان مؤسسي",
    desc:  "بنية تقنية بمعايير دولية تضمن حماية البيانات وإتاحة النظام على مدار الساعة.",
    gradient: "from-royal-500 to-indigo-600",
  },
  {
    icon: Headset,
    title: "دعم لا يتوقف",
    desc:  "فريق دعم محلي يعرف بيئتك ويستجيب لك بالعربية — 24 ساعة، 7 أيام في الأسبوع.",
    gradient: "from-violet-600 to-indigo-700",
  },
] as const;

/* ── Wave SVG divider (hero → content) ──────────────────────── */
function WaveDivider({ fill = "bg-background" }: { fill?: string }) {
  return (
    <div className="pointer-events-none absolute bottom-0 inset-x-0 overflow-hidden leading-[0]">
      <svg
        viewBox="0 0 1440 56"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={cx("w-full h-14", fill)}
        aria-hidden="true"
      >
        <path d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 L1440,56 L0,56 Z" />
      </svg>
    </div>
  );
}

/* ── Gradient stat card ──────────────────────────────────────── */
function GradientStatCard({
  icon: Icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
  label: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-[0_4px_24px_rgb(99_102_241/0.08)] ring-1 ring-indigo-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(99_102_241/0.15)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient text-white shadow-glow-brand">
          <Icon size={22} />
        </div>
        <p className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Reveal>
  );
}

/* ── Component ─────────────────────────────────────────────── */
function HomePage() {
  const { setting, products, clients, testimonials, partners, services } = Route.useLoaderData();

  useSeo({
    title:       `${setting?.site_name_ar ?? "ألفا بيتا"} | أنظمة برمجية للمؤسسات`,
    description: setting?.tagline_ar ?? "شركة ليبية متخصصة في تطوير الأنظمة البرمجية للمؤسسات",
  });

  const featured     = products.filter((p) => p.is_featured).slice(0, 3);
  const heroProducts = (featured.length > 0 ? featured : products).slice(0, 2);

  return (
    <main>

      {/* ══════════════════════════════════════════════════════
          HERO — Deep space gradient with violet overtones
      ══════════════════════════════════════════════════════ */}
      <section className="bg-hero-v2 relative overflow-hidden pb-14 pt-16 text-white sm:pb-20 sm:pt-24 lg:pt-28">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" />

        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb animate-orb-drift absolute -start-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="orb animate-orb-drift absolute -end-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" style={{ animationDelay: "-4s" }} />
          <div className="orb absolute start-1/2 -top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-royal-600/15 blur-3xl" />
        </div>

        <BrandWatermark className="-start-16 -bottom-32 h-[24rem] w-[24rem] opacity-[0.04]" />

        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

            {/* ── Text column ── */}
            <div className="animate-fade-up">
              {/* Live badge */}
              <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-white/85">
                  {setting?.site_name_ar ?? "ألفا بيتا"} — الشريك التقني للمؤسسات الليبية
                </span>
              </div>

              {/* H1 with gradient accent */}
              <h1 className="text-[2.8rem] font-extrabold leading-[1.15] tracking-tight sm:text-[3.75rem] sm:leading-[1.08]">
                {setting?.tagline_ar ? (
                  setting.tagline_ar
                ) : (
                  <>
                    نصنع البرمجيات،
                    <br />
                    <span className="text-gradient-brand">نبني المستقبل</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-lg text-[1.05rem] leading-[1.75] text-white/70">
                أنظمة مؤسسية متكاملة للتأمين والرعاية الصحية وتخطيط موارد المؤسسات —
                مصممة للسوق الليبي بمعايير عالمية ودعم عربي كامل.
              </p>

              {/* Sector chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {SECTORS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="sector-chip inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                  >
                    <Icon size={11} className="text-indigo-300" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton
                  to="/request-demo"
                  variant="gradient"
                  size="lg"
                  className="rounded-xl px-8 shadow-[0_8px_30px_rgb(99_102_241/0.45)]"
                >
                  <Sparkles size={17} />
                  اطلب عرضاً توضيحياً
                </LinkButton>
                <LinkButton to="/software" variant="ghostDark" size="lg" className="rounded-xl border-white/20">
                  استعرض الأنظمة
                </LinkButton>
              </div>

              {/* Mini stats */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  { val: "+10",  lbl: "سنوات خبرة" },
                  { val: "+50",  lbl: "مؤسسة تثق بنا" },
                  { val: "24/7", lbl: "دعم فني" },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <p className="text-gradient-brand text-2xl font-extrabold">{val}</p>
                    <p className="mt-0.5 text-xs text-white/55">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dashboard mockup ── */}
            <div
              className="animate-fade-up relative hidden sm:block"
              style={{ animationDelay: "180ms" }}
            >
              <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-indigo-600/25 blur-3xl" />
              <div className="glass-premium relative rounded-3xl p-3 shadow-glow-brand">
                <DashboardMockup />
              </div>
              {heroProducts.map((p, i) => (
                <Link
                  key={p.id}
                  to="/software/$slug"
                  params={{ slug: p.slug }}
                  style={{ bottom: `${i * 62 + 20}px` }}
                  className="glass-premium absolute -start-6 flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 hover:bg-white/15"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/15">
                    {p.logo ? (
                      <img src={mediaUrl(p.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <MonitorCheck size={15} className="text-indigo-300" />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-white">{p.name_ar}</span>
                  <ArrowLeft size={13} className="text-indigo-300" />
                </Link>
              ))}
            </div>
          </div>
        </Container>

        {/* Client logo strip */}
        {clients.length > 0 && (
          <div className="mt-10 border-t border-white/8 bg-black/15 py-5">
            <Container>
              <p className="mb-3 text-center text-xs text-white/40">
                مؤسسات رائدة تدير أعمالها بأنظمة ألفا بيتا
              </p>
              <Marquee>
                {clients.map((c) => (
                  <Link
                    key={c.id}
                    to="/clients"
                    title={c.name_ar}
                    className="flex shrink-0 items-center gap-2 opacity-50 transition-opacity hover:opacity-80"
                  >
                    {c.logo && (
                      <img src={mediaUrl(c.logo.url) ?? ""} alt={c.name_ar} className="h-7 w-7 rounded-md object-cover" />
                    )}
                    <span className="whitespace-nowrap text-sm font-medium text-white/80">{c.name_ar}</span>
                  </Link>
                ))}
              </Marquee>
            </Container>
          </div>
        )}

        {/* Wave divider */}
        <WaveDivider />
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS — Gradient icon cards
      ══════════════════════════════════════════════════════ */}
      <section className="bg-indigo-50/40 py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <GradientStatCard icon={Clock}        value={<CountUp end={10} prefix="+" />}                    label="سنوات خبرة متراكمة" delay={0}   />
            <GradientStatCard icon={Building2}    value={<CountUp end={50} prefix="+" />}                    label="مؤسسة تثق بأنظمتنا" delay={70}  />
            <GradientStatCard icon={MonitorCheck} value={<CountUp end={products.length || 8} suffix="+" />}  label="نظام مؤسسي متكامل"  delay={140} />
            <GradientStatCard icon={Headset}      value={<>24/7</>}                                          label="دعم فني لا يتوقف"    delay={210} />
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <Section>
        <SectionHeading
          eyebrow="منظومة البرمجيات"
          title="أنظمة تدير مؤسستك من طرف إلى طرف"
          description="حلول قابلة للتخصيص تغطي التأمين والرعاية الصحية والمالية والموارد البشرية"
        />
        {products.length === 0 ? (
          <EmptyState message="لا توجد أنظمة منشورة حالياً" />
        ) : (
          <Reveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <Link key={p.id} to="/software/$slug" params={{ slug: p.slug }} className="group">
                <div className="card-v2 flex h-full flex-col p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl icon-gradient-soft">
                      {p.logo ? (
                        <img src={mediaUrl(p.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <MonitorCheck size={22} className="text-indigo-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800">{p.name_ar}</h3>
                        {p.is_featured && (
                          <span className="shrink-0 rounded-full bg-gradient-cta px-2.5 py-0.5 text-[0.65rem] font-semibold text-white">
                            مميز
                          </span>
                        )}
                      </div>
                      {p.category && (
                        <p className="mt-0.5 text-xs text-slate-400">{p.category.name_ar}</p>
                      )}
                    </div>
                  </div>
                  {p.short_description_ar && (
                    <p className="mt-4 flex-1 line-clamp-3 text-sm leading-relaxed text-slate-500">
                      {p.short_description_ar}
                    </p>
                  )}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all duration-150 group-hover:gap-3">
                      عرض التفاصيل <ArrowLeft size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>
        )}
        <div className="mt-10 text-center">
          <LinkButton to="/software" variant="outline" size="md" className="border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50">
            جميع الأنظمة
          </LinkButton>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          WHY ALPHABETA — Dark gradient section (Divi-style)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-brand-dark relative overflow-hidden py-20 text-white sm:py-24">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" />
        <BrandWatermark className="-end-20 -bottom-32 h-96 w-96 opacity-[0.05]" />
        <Container className="relative">
          <div className="mb-14 text-center">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300">
              <span className="inline-block h-px w-8 rounded-full bg-indigo-400" />
              لماذا ألفا بيتا
              <span className="inline-block h-px w-8 rounded-full bg-indigo-400" />
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              بنينا ثقتنا{" "}
              <span className="text-gradient-brand">بالنتائج لا بالوعود</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/65">
              منذ أكثر من عقد، نشارك المؤسسات الليبية في رحلة التحول الرقمي بكل خطوة
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {WHY_US.map(({ icon: Icon, title, desc, gradient }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="card-glass-dark flex flex-col gap-5 p-8">
                  <div className={cx("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white", gradient)}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICES (conditional)
      ══════════════════════════════════════════════════════ */}
      {services.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="خدماتنا"
            title="أكثر من مجرد برمجيات"
            description="نرافقك من التخطيط حتى التشغيل — تطوير مخصص، تحول رقمي، تدريب، ودعم مستمر"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 60}>
                <div className="group relative overflow-hidden rounded-2xl border border-indigo-100/60 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_8px_32px_rgb(99_102_241/0.12)]">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600" />
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-all duration-200 group-hover:icon-gradient group-hover:text-white">
                    <Zap size={18} />
                  </span>
                  <h3 className="font-bold text-slate-800">{s.name_ar}</h3>
                  {s.description_ar && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description_ar}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS (conditional)
      ══════════════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <Section tone="muted">
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
                    <p className="text-sm font-bold text-slate-800">{t.customer_name_ar}</p>
                    <p className="text-xs text-slate-400">
                      {[t.position_ar, t.company_ar].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                </footer>
              </Card>
            ))}
          </Reveal>
          <div className="mt-8 text-center">
            <Link to="/testimonials" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              جميع آراء العملاء ←
            </Link>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          PARTNERS (conditional)
      ══════════════════════════════════════════════════════ */}
      {partners.length > 0 && (
        <section className="border-y border-indigo-100/50 bg-card py-12">
          <Container>
            <p className="mb-6 text-center text-sm font-medium text-slate-400">شركاؤنا في النجاح</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {partners.map((p) => (
                <Link
                  key={p.id}
                  to="/partners"
                  className="flex items-center gap-2.5 opacity-55 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                >
                  {p.logo && (
                    <img src={mediaUrl(p.logo.url) ?? ""} alt={p.name_ar} className="h-8 w-8 rounded-md object-cover" />
                  )}
                  <span className="text-sm font-semibold text-slate-600" dir="ltr">
                    {p.name_en ?? p.name_ar}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="bg-hero-v2 relative overflow-hidden py-20 text-white sm:py-24">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute inset-0">
          <div className="orb absolute start-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="orb absolute end-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        </div>
        <BrandWatermark className="-end-16 -bottom-24 h-80 w-80 opacity-[0.05]" />
        <Container className="relative text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <span className="inline-block h-px w-8 rounded-full bg-indigo-400" />
            ابدأ رحلتك الرقمية اليوم
            <span className="inline-block h-px w-8 rounded-full bg-indigo-400" />
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-[2.75rem]">
            جاهز لتحويل مؤسستك{" "}
            <span className="text-gradient-brand">رقمياً؟</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[1.05rem] leading-relaxed text-white/65">
            تحدث مع فريقنا واحصل على عرض توضيحي مباشر لأي نظام، أو عرض سعر مخصص لاحتياجك.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LinkButton
              to="/request-demo"
              variant="gradient"
              size="lg"
              className="rounded-xl px-10 shadow-[0_8px_30px_rgb(99_102_241/0.50)]"
            >
              <Sparkles size={17} />
              اطلب عرضاً توضيحياً
            </LinkButton>
            <LinkButton to="/contact" variant="white" size="lg" className="rounded-xl">
              تواصل مع المبيعات
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-white/40">
            يرد عليك فريقنا خلال 24 ساعة · بدون أي التزام مسبق
          </p>
        </Container>
      </section>

    </main>
  );
}
