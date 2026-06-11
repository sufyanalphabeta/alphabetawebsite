import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import type {
  BlocksNode,
  BlocksTextNode,
  DownloadItem,
  ProductFeature,
  SoftwareProductDetail,
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
    return { product };
  },
  notFoundComponent: () => (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ color: "#0f3460" }}>النظام غير موجود</h1>
      <p style={{ color: "#888" }}>لم نعثر على النظام المطلوب.</p>
      <Link to="/software" style={{ color: "#e94560" }}>← العودة إلى البرمجيات</Link>
    </main>
  ),
  component: ProductDetailPage,
});

// ── Small shared bits ──────────────────────────────────────────────

const SECTION: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" };

function SectionTitle({ ar, en }: { ar: string; en: string }) {
  return (
    <header style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.5rem", color: "#0f3460", margin: 0 }}>{ar}</h2>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa", direction: "ltr", textAlign: "right" }}>{en}</p>
    </header>
  );
}

function renderBlocks(nodes: BlocksNode[] | null) {
  if (!nodes?.length) return null;
  return nodes.map((node, i) => {
    const text = (node.children ?? [])
      .map((c) => ("text" in c ? (c as BlocksTextNode).text : ""))
      .join("");
    if (!text.trim()) return null;
    if (node.type === "heading") {
      return <h3 key={i} style={{ color: "#0f3460" }}>{text}</h3>;
    }
    return <p key={i} style={{ color: "#555", lineHeight: 1.9, margin: "0 0 1rem" }}>{text}</p>;
  });
}

// ── Feature groups ─────────────────────────────────────────────────

const FEATURE_GROUPS: Array<{ type: ProductFeature["feature_type"]; ar: string; en: string }> = [
  { type: "feature",    ar: "المزايا الرئيسية",  en: "Features" },
  { type: "capability", ar: "قدرات النظام",      en: "Key Capabilities" },
  { type: "advantage",  ar: "لماذا هذا النظام؟", en: "Advantages" },
];

function FeaturesSection({ features }: { features: ProductFeature[] }) {
  const sorted = [...features].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <section style={{ ...SECTION, marginTop: "3.5rem" }}>
      {FEATURE_GROUPS.map((group) => {
        const items = sorted.filter((f) => (f.feature_type ?? "feature") === group.type);
        if (items.length === 0) return null;
        return (
          <div key={group.type} style={{ marginBottom: "2.5rem" }}>
            <SectionTitle ar={group.ar} en={group.en} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {items.map((f) => (
                <div key={f.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.75rem", padding: "1.25rem" }}>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: "#0f3460" }}>{f.title_ar}</h3>
                  {f.description_ar && (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", lineHeight: 1.7 }}>{f.description_ar}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ── Screenshots gallery + lightbox ─────────────────────────────────

function GallerySection({ product }: { product: SoftwareProductDetail }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const shots = product.screenshots ?? [];
  if (shots.length === 0) return null;

  return (
    <section style={{ ...SECTION, marginTop: "3.5rem" }}>
      <SectionTitle ar="لقطات من النظام" en="Screenshots" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {shots.map((shot, i) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            style={{ border: "1px solid #eef0f4", borderRadius: "0.75rem", overflow: "hidden", padding: 0, cursor: "zoom-in", background: "#fff" }}
            aria-label={`عرض الصورة ${i + 1}`}
          >
            <img
              src={mediaUrl(shot.url) ?? ""}
              alt={shot.alternativeText ?? `${product.name_ar} — صورة ${i + 1}`}
              style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(10,15,30,.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
          }}
        >
          <button
            type="button"
            aria-label="السابق"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % shots.length); }}
            style={{ position: "absolute", right: "1rem", fontSize: "2rem", color: "#fff", background: "none", border: "none", cursor: "pointer" }}
          >
            ‹
          </button>
          <img
            src={mediaUrl(shots[lightboxIndex].url) ?? ""}
            alt={shots[lightboxIndex].alternativeText ?? product.name_ar}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "0.5rem", background: "#fff" }}
          />
          <button
            type="button"
            aria-label="التالي"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + shots.length) % shots.length); }}
            style={{ position: "absolute", left: "1rem", fontSize: "2rem", color: "#fff", background: "none", border: "none", cursor: "pointer" }}
          >
            ›
          </button>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setLightboxIndex(null)}
            style={{ position: "absolute", top: "1rem", left: "1.5rem", fontSize: "1.5rem", color: "#fff", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
          <span style={{ position: "absolute", bottom: "1rem", color: "rgba(255,255,255,.7)", fontSize: "0.85rem" }}>
            {lightboxIndex + 1} / {shots.length}
          </span>
        </div>
      )}
    </section>
  );
}

// ── Videos (future-ready: renders only when CMS has videos) ───────

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

function VideosSection({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) return null;
  return (
    <section style={{ ...SECTION, marginTop: "3.5rem" }}>
      <SectionTitle ar="فيديوهات تعريفية" en="Videos" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {[...videos].sort((a, b) => a.sort_order - b.sort_order).map((video) => {
          const src = videoEmbedUrl(video);
          if (!src) return null;
          return (
            <div key={video.id} style={{ border: "1px solid #eef0f4", borderRadius: "0.75rem", overflow: "hidden", background: "#fff" }}>
              {video.provider === "internal" ? (
                <video controls poster={mediaUrl(video.thumbnail?.url) ?? undefined} style={{ width: "100%", aspectRatio: "16/9", display: "block" }}>
                  <source src={src} />
                </video>
              ) : (
                <iframe
                  src={src}
                  title={video.title_ar ?? video.title_en ?? "فيديو"}
                  style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                  allowFullScreen
                />
              )}
              {(video.title_ar || video.title_en) && (
                <p style={{ margin: 0, padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#0f3460" }}>
                  {video.title_ar ?? video.title_en}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Downloads ──────────────────────────────────────────────────────

const DOWNLOAD_KIND_AR: Record<DownloadItem["kind"], string> = {
  brochure:     "بروشور",
  datasheet:    "ورقة بيانات",
  presentation: "عرض تقديمي",
  user_guide:   "دليل المستخدم",
  other:        "ملف",
};

function DownloadsSection({ downloads }: { downloads: DownloadItem[] }) {
  const items = downloads.filter((d) => d.file?.url || d.external_url);
  if (items.length === 0) return null;
  return (
    <section style={{ ...SECTION, marginTop: "3.5rem" }}>
      <SectionTitle ar="ملفات للتحميل" en="Downloads" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {[...items].sort((a, b) => a.sort_order - b.sort_order).map((d) => (
          <a
            key={d.id}
            href={mediaUrl(d.file?.url) ?? d.external_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            download={Boolean(d.file?.url)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              border: "1px solid #0f3460", color: "#0f3460",
              padding: "0.6rem 1.1rem", borderRadius: "0.5rem",
              textDecoration: "none", fontSize: "0.9rem", background: "#fff",
            }}
          >
            ⬇ {d.title_ar}
            <span style={{ fontSize: "0.7rem", color: "#888" }}>({DOWNLOAD_KIND_AR[d.kind]})</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────

function ProductDetailPage() {
  const { product } = Route.useLoaderData();

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
      "@context":            "https://schema.org",
      "@type":               "SoftwareApplication",
      name:                  product.name_en ?? product.name_ar,
      alternateName:         product.name_ar,
      description:           product.short_description_en ?? product.short_description_ar ?? undefined,
      applicationCategory:   "BusinessApplication",
      operatingSystem:       "Web",
      url:                   pageUrl,
      ...(ogImage ? { image: ogImage } : {}),
      offers: { "@type": "Offer", price: "0", priceCurrency: "LYD", availability: "https://schema.org/InStock" },
      provider: { "@type": "Organization", name: "AlphaBeta", url: siteUrl },
    },
  });

  const modules  = [...(product.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const faqs     = [...(product.faqs ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const related  = product.related_products ?? [];
  const longDesc = renderBlocks(product.long_description_ar);

  return (
    <main style={{ paddingBottom: "4rem" }}>
      {/* Hero */}
      <section style={{ background: "#0f3460", color: "#fff", padding: "3.5rem 0" }}>
        <div style={{ ...SECTION, display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: 88, height: 88, borderRadius: "1rem", flexShrink: 0,
            background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", fontSize: "2.5rem",
          }}>
            {product.logo ? (
              <img src={mediaUrl(product.logo.url) ?? ""} alt={`شعار ${product.name_ar}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : "💻"}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <nav style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              <Link to="/software" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none" }}>البرمجيات</Link>
              <span style={{ color: "rgba(255,255,255,.4)", margin: "0 0.5rem" }}>/</span>
              <span style={{ color: "rgba(255,255,255,.85)" }}>{product.name_ar}</span>
            </nav>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>{product.name_ar}</h1>
            {product.name_en && (
              <p style={{ margin: "0.25rem 0 0", color: "rgba(255,255,255,.55)", direction: "ltr", textAlign: "right" }}>
                {product.name_en}
              </p>
            )}
            {product.tagline_ar && (
              <p style={{ margin: "0.75rem 0 0", color: "rgba(255,255,255,.85)", fontSize: "1.05rem" }}>
                {product.tagline_ar}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
              {product.category && (
                <span style={{ fontSize: "0.75rem", background: "#e94560", padding: "0.25rem 0.7rem", borderRadius: 999 }}>
                  {product.category.name_ar}
                </span>
              )}
              {(product.industries ?? []).map((ind) => (
                <span key={ind.id} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,.14)", padding: "0.25rem 0.7rem", borderRadius: 999 }}>
                  {ind.name_ar}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Link
              to="/request-demo" search={{ product: product.slug }}
              style={{ background: "#e94560", color: "#fff", padding: "0.7rem 1.6rem", borderRadius: "0.5rem", textDecoration: "none", textAlign: "center", fontWeight: 600 }}
            >
              اطلب عرضاً توضيحياً
            </Link>
            <Link
              to="/request-quote" search={{ product: product.slug }}
              style={{ background: "rgba(255,255,255,.12)", color: "#fff", padding: "0.7rem 1.6rem", borderRadius: "0.5rem", textDecoration: "none", textAlign: "center" }}
            >
              اطلب عرض سعر
            </Link>
          </div>
        </div>
      </section>

      {/* Description */}
      {(longDesc || product.short_description_ar) && (
        <section style={{ ...SECTION, marginTop: "3rem", maxWidth: 850 }}>
          <SectionTitle ar="عن النظام" en="Overview" />
          {longDesc ?? <p style={{ color: "#555", lineHeight: 1.9 }}>{product.short_description_ar}</p>}
        </section>
      )}

      {/* Features / Capabilities / Advantages */}
      {(product.features?.length ?? 0) > 0 && <FeaturesSection features={product.features!} />}

      {/* Modules */}
      {modules.length > 0 && (
        <section style={{ ...SECTION, marginTop: "3.5rem" }}>
          <SectionTitle ar="وحدات النظام" en="Modules" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {modules.map((m) => (
              <div key={m.id} style={{
                background: "#fff", borderRadius: "0.75rem", padding: "1.25rem",
                border: m.is_core ? "2px solid #0f3460" : "1px solid #eef0f4",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f3460" }}>{m.name_ar}</h3>
                  {m.is_core && (
                    <span style={{ fontSize: "0.65rem", background: "#0f3460", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: 999, whiteSpace: "nowrap" }}>
                      أساسية
                    </span>
                  )}
                </div>
                {m.description_ar && (
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#666", lineHeight: 1.7 }}>{m.description_ar}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <GallerySection product={product} />
      <VideosSection videos={product.videos ?? []} />
      <DownloadsSection downloads={product.downloads ?? []} />

      {/* FAQs */}
      {faqs.length > 0 && (
        <section style={{ ...SECTION, marginTop: "3.5rem", maxWidth: 850 }}>
          <SectionTitle ar="أسئلة شائعة" en="FAQ" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqs.map((faq) => (
              <details key={faq.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.75rem", padding: "1rem 1.25rem" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, color: "#0f3460" }}>{faq.question_ar}</summary>
                {faq.answer_ar && (
                  <p style={{ margin: "0.75rem 0 0", color: "#555", lineHeight: 1.8, fontSize: "0.9rem" }}>{faq.answer_ar}</p>
                )}
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ ...SECTION, marginTop: "3.5rem" }}>
          <SectionTitle ar="أنظمة ذات صلة" en="Related Products" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {related.map((rp) => (
              <Link
                key={rp.id}
                to="/software/$slug" params={{ slug: rp.slug }}
                style={{
                  background: "#fff", border: "1px solid #eef0f4", borderRadius: "0.75rem",
                  padding: "1.25rem", textDecoration: "none", display: "block",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f3460" }}>{rp.name_ar}</h3>
                {rp.short_description_ar && (
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#666", lineHeight: 1.7 }}>
                    {rp.short_description_ar}
                  </p>
                )}
                <span style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.8rem", color: "#e94560" }}>
                  عرض التفاصيل ←
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ ...SECTION, marginTop: "4rem" }}>
        <div style={{ background: "#0f3460", borderRadius: "1rem", padding: "2.5rem", textAlign: "center", color: "#fff" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>جاهز لتجربة {product.name_ar}؟</h2>
          <p style={{ margin: "0.5rem 0 1.5rem", color: "rgba(255,255,255,.7)" }}>
            تواصل مع فريقنا للحصول على عرض توضيحي مباشر أو عرض سعر مخصص لمؤسستك
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/request-demo" search={{ product: product.slug }}
              style={{ background: "#e94560", color: "#fff", padding: "0.7rem 1.6rem", borderRadius: "0.5rem", textDecoration: "none", fontWeight: 600 }}>
              اطلب عرضاً توضيحياً
            </Link>
            <Link to="/request-quote" search={{ product: product.slug }}
              style={{ background: "rgba(255,255,255,.12)", color: "#fff", padding: "0.7rem 1.6rem", borderRadius: "0.5rem", textDecoration: "none" }}>
              اطلب عرض سعر
            </Link>
            <Link to="/contact"
              style={{ background: "transparent", color: "#fff", padding: "0.7rem 1.6rem", borderRadius: "0.5rem", textDecoration: "none", border: "1px solid rgba(255,255,255,.4)" }}>
              تواصل مع المبيعات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
