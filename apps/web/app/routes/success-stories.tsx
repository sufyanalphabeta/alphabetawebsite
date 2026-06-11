import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection, mediaUrl } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
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

function StoryBlock({ label, labelEn, text }: { label: string; labelEn: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.92rem", color: "#0f3460" }}>
        {label} <span style={{ fontSize: "0.7rem", color: "#bbb", fontWeight: 400 }}>{labelEn}</span>
      </h3>
      <p style={{ margin: 0, fontSize: "0.88rem", color: "#555", lineHeight: 1.8 }}>{text}</p>
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
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>قصص النجاح</h1>
        <p style={{ color: "#888" }}>Success Stories</p>
      </header>

      {stories.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>لا توجد قصص منشورة حالياً</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {stories.map((story) => (
            <article
              key={story.id}
              style={{
                background: "#fff", borderRadius: "1rem", overflow: "hidden",
                border: story.is_featured ? "2px solid #e94560" : "1px solid #eef0f4",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              }}
            >
              <header style={{ background: "#0f3460", color: "#fff", padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                {story.client?.logo && (
                  <img
                    src={mediaUrl(story.client.logo.url) ?? ""}
                    alt={`شعار ${story.client.name_ar}`}
                    style={{ width: 48, height: 48, borderRadius: "0.6rem", objectFit: "cover" }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{story.title_ar}</h2>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,.6)" }}>
                    {[story.client?.name_ar, story.software_product?.name_ar].filter(Boolean).join(" • ")}
                  </p>
                </div>
                {story.software_product && (
                  <Link
                    to="/software/$slug" params={{ slug: story.software_product.slug }}
                    style={{ fontSize: "0.78rem", color: "#fff", background: "rgba(255,255,255,.14)", padding: "0.35rem 0.85rem", borderRadius: 999, textDecoration: "none" }}
                  >
                    عرض النظام ←
                  </Link>
                )}
              </header>

              <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <StoryBlock label="التحدي" labelEn="Challenge" text={story.challenge_ar} />
                <StoryBlock label="الحل"   labelEn="Solution"  text={story.solution_ar} />
                <StoryBlock label="النتائج" labelEn="Results"  text={story.results_ar} />

                {(story.metrics?.length ?? 0) > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                    {[...story.metrics!].sort((a, b) => a.sort_order - b.sort_order).map((m) => (
                      <div key={m.id} style={{ background: "#f7f8fb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#e94560" }}>{m.value}</p>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#666" }}>{m.label_ar}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(story.gallery?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {story.gallery!.map((img) => (
                      <img
                        key={img.id}
                        src={mediaUrl(img.url) ?? ""}
                        alt={img.alternativeText ?? story.title_ar}
                        style={{ width: 200, height: 120, objectFit: "cover", borderRadius: "0.6rem", border: "1px solid #eef0f4" }}
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
