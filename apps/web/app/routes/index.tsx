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
  },
  {
    icon: ShieldCheck,
    title: "أمان مؤسسي",
    desc:  "بنية تقنية بمعايير دولية تضمن حماية البيانات وإتاحة النظام على مدار الساعة.",
  },
  {
    icon: Headset,
    title: "دعم لا يتوقف",
    desc:  "فريق دعم محلي يعرف بيئتك ويستجيب لك بالعربية — 24 ساعة، 7 أيام في الأسبوع.",
  },
] as const;


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
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="bg-mesh relative overflow-hidden text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <BrandWatermark className="-start-20 -bottom-36 h-[26rem] w-[26rem] opacity-[0.04]" />

        <Container className="relative py-16 sm:py-24 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">

            {/* ── Text column ── */}
            <div className="animate-fade-up">
              {/* Live indicator badge */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                {setting?.site_name_ar ?? "ألفا بيتا"} — الشريك التقني للمؤسسات الليبية
              </div>

              {/* H1 */}
              <h1 className="text-[2.8rem] font-extrabold leading-[1.15] tracking-tight sm:text-[3.75rem] sm:leading-[1.08]">
                {setting?.tagline_ar ? (
                  setting.tagline_ar
                ) : (
                  <>
                    نصنع البرمجيات،
                    <br />
                    <span className="bg-gradient-to-l from-royal-400 to-sky-300 bg-clip-text text-transparent">
                      نبني المستقبل
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-lg text-[1.05rem] leading-[1.75] text-heroink-100/80">
                أنظمة مؤسسية متكاملة للتأمين والرعاية الصحية وتخطيط موارد المؤسسات —
                مصممة للسوق الليبي بمعايير عالمية ودعم عربي كامل.
              </p>

              {/* Sector chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {SECTORS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15"
                  >
                    <Icon size={11} className="text-royal-400" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton to="/request-demo" variant="accent" size="lg" className="shadow-lg shadow-accent-500/25">
                  اطلب عرضاً توضيحياً
                </LinkButton>
                <LinkButton to="/software" variant="ghostDark" size="lg">
                  استعرض الأنظمة
                </LinkButton>
              </div>

              {/* Mini stats bar */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                {[
                  { val: "+10",  lbl: "سنوات خبرة" },
                  { val: "+50",  lbl: "مؤسسة تثق بنا" },
                  { val: "24/7", lbl: "دعم فني" },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <p className="text-2xl font-extrabold text-white">{val}</p>
                    <p className="mt-0.5 text-xs text-heroink-200/65">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dashboard mockup column ── */}
            <div
              className="animate-fade-up relative hidden sm:block"
              style={{ animationDelay: "180ms" }}
            >
              {/* Soft glow behind mockup */}
              <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-royal-600/20 blur-3xl" />
              <div className="glass relative rounded-3xl p-3 shadow-2xl ring-1 ring-white/20">
                <DashboardMockup />
              </div>
              {/* Floating product chips */}
              {heroProducts.map((p, i) => (
                <Link
                  key={p.id}
                  to="/software/$slug"
                  params={{ slug: p.slug }}
                  style={{ bottom: `${i * 60 + 16}px` }}
                  className="glass absolute -start-6 flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all hover:bg-white/15"
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

        {/* Client logo marquee — inside hero bottom bar */}
        {clients.length > 0 && (
          <div className="border-t border-white/10 bg-black/15 py-5">
            <Container>
              <p className="mb-3.5 text-center text-xs text-heroink-300/55">
                مؤسسات رائدة تدير أعمالها بأنظمة ألفا بيتا
              </p>
              <Marquee>
                {clients.map((c) => (
                  <Link
                    key={c.id}
                    to="/clients"
                    title={c.name_ar}
                    className="flex shrink-0 items-center gap-2 opacity-55 transition-opacity hover:opacity-90"
                  >
                    {c.logo && (
                      <img
                        src={mediaUrl(c.logo.url) ?? ""}
                        alt={c.name_ar}
                        className="h-7 w-7 rounded-md object-cover"
                      />
                    )}
                    <span className="whitespace-nowrap text-sm font-medium text-heroink-200">
                      {c.name_ar}
                    </span>
                  </Link>
                ))}
              </Marquee>
            </Container>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS — light cards (not dark band)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-surface py-14 sm:py-16">
        <Container>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[
              { icon: Clock,        node: <CountUp end={10} prefix="+" />, label: "سنوات خبرة متراكمة" },
              { icon: Building2,    node: <CountUp end={50} prefix="+" />, label: "مؤسسة تثق بأنظمتنا" },
              { icon: MonitorCheck, node: <CountUp end={products.length || 8} suffix="+" />, label: "نظام مؤسسي متكامل" },
              { icon: Headset,      node: <>24/7</>,                                           label: "دعم فني لا يتوقف" },
            ].map(({ icon: StatIcon, node, label }, i) => (
              <Reveal key={label} delay={i * 70}>
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <StatIcon size={21} />
                  </span>
                  <p className="text-3xl font-extrabold tracking-tight text-primary-900 sm:text-4xl">
                    {node}
                  </p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </Reveal>
            ))}
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
                <Card className={cx(
                  "relative flex h-full flex-col overflow-hidden p-6",
                  p.is_featured && "ring-1 ring-accent-200/60",
                )}>
                  {/* Featured top accent line */}
                  {p.is_featured && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400" />
                  )}
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50 ring-1 ring-primary-100">
                      {p.logo ? (
                        <img src={mediaUrl(p.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <MonitorCheck size={22} className="text-primary-600" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-primary-900">{p.name_ar}</h3>
                        {p.is_featured && (
                          <span className="shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-[0.65rem] font-semibold text-accent-600">
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
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-all duration-150 group-hover:gap-2.5">
                      عرض التفاصيل <ArrowLeft size={14} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </Reveal>
        )}
        <div className="mt-10 text-center">
          <LinkButton to="/software" variant="outline" size="md">جميع الأنظمة</LinkButton>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          WHY ALPHABETA — always shown, static content
      ══════════════════════════════════════════════════════ */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="لماذا ألفا بيتا"
          title="بنينا ثقتنا بالنتائج لا بالوعود"
          description="منذ أكثر من عقد، نشارك المؤسسات الليبية في رحلة التحول الرقمي بكل خطوة"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="flex flex-col gap-5 rounded-2xl bg-card p-8 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-primary-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

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
                <div className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-700 group-hover:text-white">
                    <Zap size={18} />
                  </span>
                  <h3 className="font-bold text-primary-900">{s.name_ar}</h3>
                  {s.description_ar && (
                    <p className="text-sm leading-relaxed text-slate-500">{s.description_ar}</p>
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
                    <img
                      src={mediaUrl(t.image.url) ?? ""}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
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
            <Link to="/testimonials" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
              جميع آراء العملاء ←
            </Link>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════
          PARTNERS (conditional)
      ══════════════════════════════════════════════════════ */}
      {partners.length > 0 && (
        <section className="border-y border-slate-100 bg-card py-12">
          <Container>
            <p className="mb-6 text-center text-sm font-medium text-slate-400">شركاؤنا في النجاح</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {partners.map((p) => (
                <Link
                  key={p.id}
                  to="/partners"
                  className="flex items-center gap-2.5 opacity-60 transition-opacity hover:opacity-100"
                >
                  {p.logo && (
                    <img
                      src={mediaUrl(p.logo.url) ?? ""}
                      alt={p.name_ar}
                      className="h-8 w-8 rounded-md object-cover"
                    />
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
          FINAL CTA — 2 buttons + trust signal
      ══════════════════════════════════════════════════════ */}
      <section className="bg-mesh relative overflow-hidden py-20 text-white sm:py-24">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" />
        <BrandWatermark className="-end-16 -bottom-24 h-80 w-80 opacity-[0.06]" />
        <Container className="relative text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-royal-400">
            <span className="inline-block h-px w-8 rounded-full bg-royal-400" />
            ابدأ رحلتك الرقمية اليوم
            <span className="inline-block h-px w-8 rounded-full bg-royal-400" />
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-[2.75rem]">
            جاهز لتحويل مؤسستك رقمياً؟
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[1.05rem] leading-relaxed text-heroink-100/75">
            تحدث مع فريقنا واحصل على عرض توضيحي مباشر لأي نظام، أو عرض سعر مخصص لاحتياجك.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LinkButton
              to="/request-demo"
              variant="accent"
              size="lg"
              className="px-10 shadow-lg shadow-accent-500/30"
            >
              اطلب عرضاً توضيحياً
            </LinkButton>
            <LinkButton to="/contact" variant="white" size="lg">
              تواصل مع المبيعات
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-heroink-300/55">
            يرد عليك فريقنا خلال 24 ساعة · بدون أي التزام مسبق
          </p>
        </Container>
      </section>

    </main>
  );
}
