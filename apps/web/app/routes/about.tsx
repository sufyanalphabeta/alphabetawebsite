import { createFileRoute } from "@tanstack/react-router";
import { getSingle } from "~/lib/strapi";
import type { CompanyProfile } from "~/lib/types";

export const Route = createFileRoute("/about")({
  loader: async () => {
    try {
      const res = await getSingle<CompanyProfile>("company-profile");
      return { profile: res.data };
    } catch {
      return { profile: null };
    }
  },
  component: AboutPage,
});

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{
      background: "#f8f9fa",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      textAlign: "center",
      minWidth: "140px",
    }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0f3460" }}>{value}</div>
      <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function SectionCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div style={{
      borderRight: `4px solid ${accent}`,
      background: "#fff",
      borderRadius: "0.75rem",
      padding: "1.75rem 2rem",
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    }}>
      <h3 style={{ margin: "0 0 0.75rem", color: accent, fontSize: "1.25rem" }}>{title}</h3>
      <p style={{ margin: 0, lineHeight: 1.8, color: "#444" }}>{body}</p>
    </div>
  );
}

function AboutPage() {
  const { profile } = Route.useLoaderData();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>
          من نحن
        </h1>
        <p style={{ color: "#888", fontSize: "1rem" }}>About AlphaBeta</p>
      </header>

      {/* Stats */}
      {(profile?.founded_year || profile?.employee_count || profile?.headquarters_ar) && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "3rem",
        }}>
          {profile.founded_year && (
            <StatCard value={profile.founded_year} label="سنة التأسيس" />
          )}
          {profile.employee_count && (
            <StatCard value={`+${profile.employee_count}`} label="موظف متخصص" />
          )}
          {profile.headquarters_ar && (
            <StatCard value={profile.headquarters_ar} label="المقر الرئيسي" />
          )}
        </div>
      )}

      {/* Vision & Mission */}
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "3rem" }}>
        {profile?.vision_ar && (
          <SectionCard
            title="رؤيتنا"
            body={profile.vision_ar}
            accent="#e94560"
          />
        )}
        {profile?.mission_ar && (
          <SectionCard
            title="رسالتنا"
            body={profile.mission_ar}
            accent="#0f3460"
          />
        )}
        {!profile && (
          <div style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>
            لا توجد بيانات متاحة حالياً
          </div>
        )}
      </div>
    </main>
  );
}
