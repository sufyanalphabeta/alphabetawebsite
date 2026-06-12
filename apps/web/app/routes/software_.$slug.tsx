import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Layers,
  MonitorCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { formatFileSize, formatDate, LANGUAGE_LABEL, fileExtBadge } from "~/lib/format";
import { Badge, BrowserFrame, buttonClass, Card, Container, cx, LinkButton, Reveal, SectionHeading } from "~/components/ui";
import type {
  BlocksNode,
  BlocksTextNode,
  DownloadCenterItem,
  DownloadItem,
  ProductFeature,
  SoftwareProductDetail,
  SupportArticle,
  VideoItem,
} from "~/lib/types";

const DETAIL_POPULATE: Record<string, string> = {
  "populate[logo]":            "true",
  "populate[main_image]":      "true",
  "populate[screenshots]":     "true",
  "populate[category]":        "true",
  "populate[industries]":      "true",
  "populate[features]":        "true",
  "populate[modules]":         "true",
  "populate[faqs]":            "true",
  "populate[videos][populate]":    "*",
  "populate[downloads][populate]": "*",
  "populate[related_products][populate][0]": "category",
  "populate[related_products][populate][1]": "logo",
  "populate[clients][populate][0]":          "logo",
  "populate[clients][populate][1]":          "industry",
  "populate[success_stories][populate][0]":  "metrics",
  "populate[success_stories][populate][1]":  "client",
  "populate[seo][populate]":   "*",
};

export const Route = createFileRoute("/software_/$slug")({
  loader: async ({ params }) => {
    const res = await getCollection<SoftwareProductDetail>("software-products", {
      "filters[slug][$eq]": params.slug,
      "filters[publishedAt][$notNull]": "true",
      ...DETAIL_POPULATE,
    });
    const product = res.data[0];
    if (!product) throw notFound();

    const [downloadItems, supportArticles] = await Promise.all([
      getCollection<DownloadCenterItem>("download-items", {
        "sort[0]": "sort_order:asc",
        "populate[file]": "true",
        "populate[category]": "true",
        "filters[software_product][slug][$eq]": params.slug,
        "filters[publishedAt][$notNull]": "true",
      }).then((r) => r.data).catch(() => [] as DownloadCenterItem[]),
      getCollection<SupportArticle>("support-articles", {
        "sort[0]": "sort_order:asc",
        "populate[category]": "true",
        "filters[software_product][slug][$eq]": params.slug,
        "filters[publishedAt][$notNull]": "true",
      }).then((r) => r.data).catch(() => [] as SupportArticle[]),
    ]);

    return { product, downloadItems, supportArticles };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-primary-800">النظام غير موجود</h1>
      <p className="mt-2 text-slate-400">لم نعثر على النظام المطلوب.</p>
      <Link to="/software" className="mt-4 inline-block font-semibold text-accent-600">← العودة إلى البرمجيات</Link>
    </main>
  ),
  component: ProductDetailPage,
});

/* ── helpers ───────────────────────────────────────────────── */

function renderBlocks(nodes: BlocksNode[] | null) {
  if (!nodes?.length) return null;
  return nodes.map((node, i) => {
    const text = (node.children ?? [])
      .map((c) => ("text" in c ? (c as BlocksTextNode).text : ""))
      .join("");
    if (!text.trim()) return null;
    if (node.type === "heading") {
      return <h3 key={i} className="mt-6 text-xl font-bold text-primary-900">{text}</h3>;
    }
    return <p key={i} className="mt-4 leading-loose text-slate-600">{text}</p>;
  });
}

const FEATURE_GROUPS: Array<{
  type: NonNullable<ProductFeature["feature_type"]>;
  ar: string; en: string; icon: typeof Sparkles;
}> = [
  { type: "feature",    ar: "المزايا الرئيسية",  en: "Features",         icon: Sparkles },
  { type: "capability", ar: "قدرات النظام",      en: "Key Capabilities", icon: Layers },
  { type: "advantage",  ar: "لماذا هذا النظام؟", en: "Advantages",       icon: Trophy },
];

const SUBNAV: Array<{ id: string; label: string }> = [
  { id: "overview",  label: "نظرة عامة" },
  { id: "audiences", label: "لمن النظام؟" },
  { id: "features",  label: "المزايا" },
  { id: "modules",   label: "الوحدات" },
  { id: "gallery",   label: "الصور" },
  { id: "resources", label: "الموارد" },
  { id: "faq",       label: "الأسئلة" },
];

function videoEmbedUrl(video: VideoItem): string | null {
  if (video.provider === "internal") return mediaUrl(video.video_file?.url);
  if (!video.url) return null;
  if (video.provider === "youtube") {
    const id = video.url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : video.url;
  }
  if (video.provider === "vimeo") {
    const id = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : video.url;
  }
  return video.url;
}

const DOWNLOAD_KIND_AR: Record<DownloadItem["kind"], string> = {
  brochure:     "بروشور",
  datasheet:    "ورقة بيانات",
  presentation: "عرض تقديمي",
  user_guide:   "دليل المستخدم",
  other:        "ملف",
};

/* ── gallery ───────────────────────────────────────────────── */

function GallerySection({ product }: { product: SoftwareProductDetail }) {
  const [index, setIndex] = useState<number | null>(null);
  const shots = product.screenshots ?? [];
  if (shots.length === 0) return null;

  return (
    <section id="gallery" className="scroll-mt-28 py-14">
      <Container>
        <SectionHeading align="start" eyebrow="Screenshots" title="لقطات من النظام" />
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot, i) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => setIndex(i)}
              className="group block text-start transition-transform duration-200 hover:-translate-y-1"
              aria-label={`عرض الصورة ${i + 1}`}
            >
              <BrowserFrame url={`${product.slug}.alphabeta.ly`}>
                <img
                  src={mediaUrl(shot.url) ?? ""}
                  alt={shot.alternativeText ?? `${product.name_ar} — صورة ${i + 1}`}
                  className="h-44 w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </BrowserFrame>
            </button>
          ))}
        </Reveal>
      </Container>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIndex(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/90 p-6 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="السابق"
            onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % shots.length); }}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-2xl text-white hover:bg-white/20"
          >
            ‹
          </button>
          <img
            src={mediaUrl(shots[index].url) ?? ""}
            alt={shots[index].alternativeText ?? product.name_ar}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg bg-white"
          />
          <button
            type="button"
            aria-label="التالي"
            onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + shots.length) % shots.length); }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-2xl text-white hover:bg-white/20"
          >
            ›
          </button>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setIndex(null)}
            className="absolute left-6 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <span className="absolute bottom-5 text-sm text-white/70">{index + 1} / {shots.length}</span>
        </div>
      )}
    </section>
  );
}

/* ── page ──────────────────────────────────────────────────── */

function ProductDetailPage() {
  const data = Route.useLoaderData();
  const product = data.product;
  const downloadItems   = data.downloadItems ?? [];
  const supportArticles = data.supportArticles ?? [];

  const siteUrl  = typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl  = `${siteUrl}/software/${product.slug}`;
  const seo      = product.seo;
  const ogImage  = mediaUrl(seo?.og_image?.url ?? product.main_image?.url ?? product.screenshots?.[0]?.url);

  useSeo({
    title:         seo?.meta_title_ar ?? `${product.name_ar} | ألفا بيتا`,
    description:   seo?.meta_description_ar ?? product.short_description_ar,
    ogTitle:       seo?.og_title_ar ?? product.name_ar,
    ogDescription: seo?.meta_description_ar ?? product.short_description_ar,
    ogImage,
    ogType:        "website",
    canonical:     seo?.canonical_url ?? pageUrl,
    noIndex:       seo?.no_index ?? false,
    twitterCard:   seo?.twitter_card ?? "summary_large_image",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "SoftwareApplication",
      name:                product.name_en ?? product.name_ar,
      alternateName:       product.name_ar,
      description:         product.short_description_en ?? product.short_description_ar ?? undefined,
      applicationCategory: "BusinessApplication",
      operatingSystem:     "Web",
      url:                 pageUrl,
      ...(ogImage ? { image: ogImage } : {}),
      offers: { "@type": "Offer", price: "0", priceCurrency: "LYD", availability: "https://schema.org/InStock" },
      provider: { "@type": "Organization", name: "AlphaBeta", url: siteUrl },
    },
  });

  const features  = [...(product.features ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const modules   = [...(product.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const faqs      = [...(product.faqs ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const related   = product.related_products ?? [];
  const clients   = product.clients ?? [];
  const stories   = [...(product.success_stories ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const metrics   = stories.flatMap((s) => s.metrics ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const audiences = product.target_audiences ?? [];
  const videos    = [...(product.videos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cmpDownloads = (product.downloads ?? []).filter((d) => d.file?.url || d.external_url);
  const longDesc  = renderBlocks(product.long_description_ar);
  const hasResources = downloadItems.length > 0 || supportArticles.length > 0 || cmpDownloads.length > 0;

  const visibleSubnav = SUBNAV.filter((s) => {
    if (s.id === "audiences") return audiences.length > 0;
    if (s.id === "features")  return features.length > 0;
    if (s.id === "modules")   return modules.length > 0;
    if (s.id === "gallery")   return (product.screenshots?.length ?? 0) > 0;
    if (s.id === "resources") return hasResources;
    if (s.id === "faq")       return faqs.length > 0;
    return true;
  });

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-mesh relative overflow-hidden text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <Container className="relative py-14 sm:py-16">
          <nav className="mb-6 flex items-center gap-2 text-sm text-primary-100/60">
            <Link to="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link to="/software" className="hover:text-white">البرمجيات</Link>
            <span>/</span>
            <span className="text-primary-100">{product.name_ar}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-6">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
              {product.logo ? (
                <img src={mediaUrl(product.logo.url) ?? ""} alt={`شعار ${product.name_ar}`} className="h-full w-full object-cover" />
              ) : (
                <MonitorCheck size={32} />
              )}
            </span>

            <div className="min-w-[260px] flex-1">
              <h1 className="text-3xl font-bold sm:text-4xl">{product.name_ar}</h1>
              {product.name_en && (
                <p dir="ltr" className="mt-1 text-start text-sm text-primary-100/50">{product.name_en}</p>
              )}
              {product.tagline_ar && (
                <p className="mt-3 max-w-2xl text-lg text-primary-100/85">{product.tagline_ar}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {product.category && <Badge tone="accent">{product.category.name_ar}</Badge>}
                {(product.industries ?? []).map((ind) => (
                  <Badge key={ind.id} tone="darkGlass">{ind.name_ar}</Badge>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto">
              <Link to="/request-demo" search={{ product: product.slug }} className={buttonClass("accent", "md")}>
                اطلب عرضاً توضيحياً
              </Link>
              <Link to="/request-quote" search={{ product: product.slug }} className={buttonClass("ghostDark", "md")}>
                اطلب عرض سعر
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Sticky subnav ────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <Container>
          <nav className="flex gap-1 overflow-x-auto py-1.5">
            {visibleSubnav.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      {/* ── Overview ─────────────────────────────────────── */}
      <section id="overview" className="scroll-mt-28 py-14">
        <Container className="max-w-4xl">
          <SectionHeading align="start" eyebrow="Overview" title="عن النظام" />
          {longDesc ?? <p className="leading-loose text-slate-600">{product.short_description_ar}</p>}
        </Container>
      </section>

      {/* ── Who is this system for? ──────────────────────── */}
      {audiences.length > 0 && (
        <section id="audiences" className="scroll-mt-28 bg-surface py-14">
          <Container>
            <SectionHeading
              align="start"
              eyebrow="Who Is This System For?"
              title="لمن هذا النظام؟"
              description="صُمم النظام ليخدم هذه الجهات والفرق بشكل مباشر"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a, i) => (
                <Card key={i} className="flex items-center gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    {i % 2 === 0 ? <Building2 size={20} className="text-primary-600" /> : <Users size={20} className="text-primary-600" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-primary-900">{a.title_ar}</p>
                    {a.title_en && <p dir="ltr" className="truncate text-start text-xs text-slate-400">{a.title_en}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Features by group ────────────────────────────── */}
      {features.length > 0 && (
        <section id="features" className="scroll-mt-28 py-14">
          <Container>
            {FEATURE_GROUPS.map((group) => {
              const items = features.filter((f) => (f.feature_type ?? "feature") === group.type);
              if (items.length === 0) return null;
              const Icon = group.icon;
              return (
                <div key={group.type} className="mb-12 last:mb-0">
                  <SectionHeading align="start" eyebrow={group.en} title={group.ar} />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((f) => (
                      <Card key={f.id} className="p-5">
                        <Icon size={20} className="text-accent-500" />
                        <h3 className="mt-3 font-bold text-primary-900">{f.title_ar}</h3>
                        {f.description_ar && (
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.description_ar}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </Container>
        </section>
      )}

      {/* ── Modules ──────────────────────────────────────── */}
      {modules.length > 0 && (
        <section id="modules" className="scroll-mt-28 bg-surface py-14">
          <Container>
            <SectionHeading align="start" eyebrow="Modules" title="وحدات النظام" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <Card key={m.id} className={cx("p-5", m.is_core && "border-primary-300 ring-1 ring-primary-200")}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-primary-900">{m.name_ar}</h3>
                    {m.is_core && <Badge tone="primary" className="shrink-0">أساسية</Badge>}
                  </div>
                  {m.description_ar && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{m.description_ar}</p>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      <GallerySection product={product} />

      {/* ── Videos ───────────────────────────────────────── */}
      {videos.length > 0 && (
        <section className="bg-surface py-14">
          <Container>
            <SectionHeading align="start" eyebrow="Videos" title="فيديوهات تعريفية" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const src = videoEmbedUrl(video);
                if (!src) return null;
                return (
                  <Card key={video.id} className="overflow-hidden">
                    {video.provider === "internal" ? (
                      <video controls poster={mediaUrl(video.thumbnail?.url) ?? undefined} className="aspect-video w-full">
                        <source src={src} />
                      </video>
                    ) : (
                      <iframe src={src} title={video.title_ar ?? "فيديو"} className="aspect-video w-full border-0" allowFullScreen />
                    )}
                    {(video.title_ar || video.title_en) && (
                      <p className="px-4 py-3 text-sm font-medium text-primary-900">{video.title_ar ?? video.title_en}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ── Success metrics ──────────────────────────────── */}
      {metrics.length > 0 && (
        <section className="bg-hero py-14 text-white">
          <Container>
            <SectionHeading dark eyebrow="Success Metrics" title="نتائج حققها عملاؤنا" />
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.id} className="rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10">
                  <p className="text-3xl font-bold text-accent-400">{m.value}</p>
                  <p className="mt-1.5 text-sm text-primary-100/75">{m.label_ar}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Case studies + clients ───────────────────────── */}
      {(stories.length > 0 || clients.length > 0) && (
        <section className="py-14">
          <Container>
            {stories.length > 0 && (
              <>
                <SectionHeading align="start" eyebrow="Case Studies" title="قصص نجاح مرتبطة" />
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <Link key={story.id} to="/success-stories" className="group">
                      <Card className="flex h-full flex-col p-6">
                        <h3 className="font-bold leading-snug text-primary-900">{story.title_ar}</h3>
                        {story.client && <p className="mt-1 text-xs text-slate-400">{story.client.name_ar}</p>}
                        {story.results_ar && (
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{story.results_ar}</p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-transform group-hover:-translate-x-1">
                          اقرأ القصة كاملة <ArrowLeft size={15} />
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {clients.length > 0 && (
              <div className={cx(stories.length > 0 && "mt-12")}>
                <p className="mb-5 text-sm font-semibold text-slate-400">يثقون بهذا النظام</p>
                <div className="flex flex-wrap gap-3">
                  {clients.map((client) => (
                    <Link
                      key={client.id}
                      to="/clients"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                      {client.logo && (
                        <img src={mediaUrl(client.logo.url) ?? ""} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      )}
                      <span>
                        <span className="block text-sm font-bold text-primary-900">{client.name_ar}</span>
                        {client.industry && <span className="block text-xs text-slate-400">{client.industry.name_ar}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* ── Resources: downloads + docs ──────────────────── */}
      {hasResources && (
        <section id="resources" className="scroll-mt-28 bg-surface py-14">
          <Container>
            <SectionHeading align="start" eyebrow="Resources" title="ملفات وأدلة هذا النظام" />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-3">
                {downloadItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-700 text-[0.6rem] font-bold text-white">
                      {fileExtBadge(item.file?.ext)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-primary-900">{item.title_ar}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {[
                          item.category?.name_ar,
                          LANGUAGE_LABEL[item.language],
                          item.version ? `الإصدار ${item.version}` : null,
                          formatDate(item.release_date),
                          item.file ? formatFileSize(item.file.size) : null,
                        ].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    {item.file && (
                      <a
                        href={mediaUrl(item.file.url) ?? "#"}
                        download
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
                      >
                        <Download size={15} /> تحميل
                      </a>
                    )}
                  </div>
                ))}
                {cmpDownloads.map((d) => (
                  <a
                    key={`cmp-${d.id}`}
                    href={mediaUrl(d.file?.url) ?? d.external_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={Boolean(d.file?.url)}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-700 text-white">
                      <Download size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-primary-900">{d.title_ar}</span>
                      <span className="block text-xs text-slate-400">{DOWNLOAD_KIND_AR[d.kind]}</span>
                    </span>
                  </a>
                ))}
                {downloadItems.length > 0 && (
                  <Link to="/downloads" className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-accent-600 hover:text-accent-700">
                    تصفح مركز التحميلات كاملاً <ArrowLeft size={14} />
                  </Link>
                )}
              </div>

              {supportArticles.length > 0 && (
                <div className="space-y-3">
                  {supportArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={article.category ? "/support/category/$slug" : "/support"}
                      params={article.category ? { slug: article.category.slug } : undefined}
                      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                        <FileText size={18} className="text-primary-600" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-primary-900">{article.title_ar}</span>
                        {article.category && <span className="block text-xs text-slate-400">{article.category.name_ar}</span>}
                        {article.excerpt_ar && (
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{article.excerpt_ar}</span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-28 py-14">
          <Container className="max-w-4xl">
            <SectionHeading align="start" eyebrow="FAQ" title="أسئلة شائعة" />
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="group rounded-xl border border-slate-200 bg-white shadow-card">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 font-bold text-primary-900">
                    {faq.question_ar}
                    <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  {faq.answer_ar && (
                    <p className="border-t border-slate-100 p-5 pt-4 text-sm leading-loose text-slate-600">{faq.answer_ar}</p>
                  )}
                </details>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Related products ─────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-surface py-14">
          <Container>
            <SectionHeading align="start" eyebrow="Related Products" title="أنظمة ذات صلة" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link key={rp.id} to="/software/$slug" params={{ slug: rp.slug }} className="group">
                  <Card className="flex h-full flex-col p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50">
                        {rp.logo ? (
                          <img src={mediaUrl(rp.logo.url) ?? ""} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <MonitorCheck size={18} className="text-primary-600" />
                        )}
                      </span>
                      <h3 className="font-bold text-primary-900">{rp.name_ar}</h3>
                    </div>
                    {rp.short_description_ar && (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{rp.short_description_ar}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-transform group-hover:-translate-x-1">
                      عرض التفاصيل <ArrowLeft size={15} />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="bg-cta py-16 text-white">
        <Container className="text-center">
          <CheckCircle2 size={36} className="mx-auto text-accent-400" />
          <h2 className="mt-4 text-3xl font-bold">جاهز لتجربة {product.name_ar}؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100/80">
            تواصل مع فريقنا للحصول على عرض توضيحي مباشر أو عرض سعر مخصص لمؤسستك.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/request-demo" search={{ product: product.slug }} className={buttonClass("accent", "lg")}>
              اطلب عرضاً توضيحياً
            </Link>
            <Link to="/request-quote" search={{ product: product.slug }} className={buttonClass("white", "lg")}>
              اطلب عرض سعر
            </Link>
            <LinkButton to="/contact" variant="ghostDark" size="lg">تواصل مع المبيعات</LinkButton>
          </div>
        </Container>
      </section>
    </main>
  );
}
