import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CircleHelp, Settings, Wrench } from "lucide-react";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Card, Container, LinkButton, PageHero } from "~/components/ui";
import { SupportArticles } from "~/components/SupportArticles";
import type { SupportArticle, SupportCategory } from "~/lib/types";

export const Route = createFileRoute("/support")({
  loader: async () => {
    try {
      const [catsRes, articlesRes] = await Promise.all([
        getCollection<SupportCategory>("support-categories", {
          "sort[0]": "sort_order:asc",
          "pagination[pageSize]": "100",
        }),
        getCollection<SupportArticle>("support-articles", {
          "sort[0]": "sort_order:asc",
          "populate[category]": "true",
          "populate[software_product]": "true",
          "filters[publishedAt][$notNull]": "true",
          "pagination[pageSize]": "100",
        }),
      ]);
      return { categories: catsRes.data, articles: articlesRes.data };
    } catch {
      return { categories: [], articles: [] };
    }
  },
  component: SupportPage,
});

const CATEGORY_ICON: Record<string, typeof Settings> = {
  "installation-guides": Settings,
  "user-manuals":        BookOpen,
  "troubleshooting":     Wrench,
};

function SupportPage() {
  const { categories, articles } = Route.useLoaderData();

  useSeo({
    title:       "مركز الدعم | ألفا بيتا",
    description: "أدلة التثبيت والاستخدام وحل المشكلات لأنظمة ألفا بيتا",
  });

  return (
    <main>
      <PageHero
        title="كيف يمكننا مساعدتك؟"
        titleEn="SUPPORT CENTER"
        subtitle="أدلة التثبيت والاستخدام، حلول المشكلات الشائعة، وإجابات لأكثر الأسئلة تكراراً"
      />

      <Container className="max-w-5xl py-12">
        {/* Category cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICON[cat.slug] ?? BookOpen;
            return (
              <Link key={cat.id} to="/support/category/$slug" params={{ slug: cat.slug }}>
                <Card className="h-full p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                    <Icon size={22} className="text-primary-600" />
                  </span>
                  <h2 className="mt-3 font-bold text-primary-900">{cat.name_ar}</h2>
                  {cat.description_ar && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{cat.description_ar}</p>
                  )}
                </Card>
              </Link>
            );
          })}
          <Link to="/faq">
            <Card className="h-full bg-primary-700 p-6 text-center hover:bg-primary-800">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <CircleHelp size={22} className="text-white" />
              </span>
              <h2 className="mt-3 font-bold text-white">الأسئلة الشائعة</h2>
              <p className="mt-1 text-xs text-primary-100/60">إجابات لأكثر الأسئلة تكراراً</p>
            </Card>
          </Link>
        </div>

        <SupportArticles articles={articles} />

        {/* Contact support CTA */}
        <div className="mt-12 rounded-2xl bg-cta p-8 text-center text-white">
          <h2 className="text-xl font-bold">لم تجد ما تبحث عنه؟</h2>
          <p className="mt-1.5 text-sm text-primary-100/75">فريق الدعم الفني جاهز لمساعدتك على مدار الساعة</p>
          <LinkButton to="/contact" variant="accent" className="mt-5">تواصل مع الدعم الفني</LinkButton>
        </div>
      </Container>
    </main>
  );
}
