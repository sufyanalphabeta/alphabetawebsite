import { createFileRoute } from "@tanstack/react-router";
import { Compass, Target } from "lucide-react";
import { getSingle } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, EmptyState, PageHero, StatTile } from "~/components/ui";
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

function AboutPage() {
  const { profile } = Route.useLoaderData();

  useSeo({
    title:       "من نحن | ألفا بيتا",
    description: "تعرف على ألفا بيتا — شركة ليبية متخصصة في تطوير الأنظمة البرمجية للمؤسسات",
  });

  return (
    <main>
      <PageHero
        title="من نحن"
        titleEn="ABOUT ALPHABETA"
        subtitle="شركة ليبية متخصصة في تطوير الأنظمة البرمجية للمؤسسات — نمزج الخبرة المحلية بالمعايير العالمية"
      />

      <Container className="max-w-4xl py-14">
        {/* Stats */}
        {(profile?.founded_year || profile?.employee_count || profile?.headquarters_ar) && (
          <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {profile.founded_year && <StatTile value={String(profile.founded_year)} label="سنة التأسيس" />}
            {profile.employee_count && <StatTile value={`+${profile.employee_count}`} label="موظف متخصص" />}
            {profile.headquarters_ar && <StatTile value={profile.headquarters_ar} label="المقر الرئيسي" />}
          </div>
        )}

        {/* Vision & Mission */}
        {profile ? (
          <div className="grid gap-6 md:grid-cols-2">
            {profile.vision_ar && (
              <Card className="p-7">
                <Compass size={24} className="text-royal-500" />
                <h2 className="mt-3 text-xl font-bold text-primary-900">رؤيتنا</h2>
                <p className="mt-2 leading-loose text-slate-600">{profile.vision_ar}</p>
              </Card>
            )}
            {profile.mission_ar && (
              <Card className="p-7">
                <Target size={24} className="text-primary-600" />
                <h2 className="mt-3 text-xl font-bold text-primary-900">رسالتنا</h2>
                <p className="mt-2 leading-loose text-slate-600">{profile.mission_ar}</p>
              </Card>
            )}
          </div>
        ) : (
          <EmptyState message="لا توجد بيانات متاحة حالياً" />
        )}
      </Container>
    </main>
  );
}
