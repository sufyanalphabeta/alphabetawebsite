import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { createEntry, getCollection, getSingle } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { Button, Card, Container, cx, PageHero } from "~/components/ui";
import type { Page, SiteSetting } from "~/lib/types";

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[0.95rem] text-slate-700 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    const [page, setting] = await Promise.all([
      getCollection<Page>("pages", { "filters[slug][$eq]": "contact", "locale": "ar" })
        .then((r) => r.data[0] ?? null).catch(() => null),
      getSingle<SiteSetting>("site-setting", { locale: "ar" })
        .then((r) => r.data).catch(() => null),
    ]);
    return { page, setting };
  },
  component: ContactPage,
});

function ContactPage() {
  const { page, setting } = Route.useLoaderData();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useSeo({
    title:       "تواصل معنا | ألفا بيتا",
    description: "تواصل مع فريق ألفا بيتا — مبيعات، دعم فني، وشراكات",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      await createEntry("contact-submissions", {
        full_name:  String(fd.get("name") ?? ""),
        email:      String(fd.get("email") ?? ""),
        message:    String(fd.get("message") ?? ""),
        subject:    "رسالة من صفحة تواصل معنا",
        source_url: window.location.href,
        locale:     "ar",
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main>
      <PageHero
        title={page?.title ?? "تواصل معنا"}
        titleEn="CONTACT US"
        subtitle="فريقنا جاهز للإجابة عن استفساراتك — مبيعات، دعم فني، أو شراكات"
      />

      <Container className="grid max-w-5xl gap-8 py-14 lg:grid-cols-5">
        {/* Contact info */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
              <Phone size={19} className="text-primary-600" />
            </span>
            <div>
              <p className="text-xs text-slate-400">الهاتف</p>
              <p dir="ltr" className="font-bold text-primary-900">{setting?.phone_primary ?? "+218 91 000 0000"}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
              <Mail size={19} className="text-primary-600" />
            </span>
            <div>
              <p className="text-xs text-slate-400">البريد الإلكتروني</p>
              <p dir="ltr" className="font-bold text-primary-900">{setting?.primary_email ?? "info@alphabeta.ly"}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
              <MapPin size={19} className="text-primary-600" />
            </span>
            <div>
              <p className="text-xs text-slate-400">المقر الرئيسي</p>
              <p className="font-bold text-primary-900">طرابلس، ليبيا</p>
            </div>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          {status === "sent" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
              <p className="mt-4 text-lg font-bold text-emerald-700">تم استلام رسالتك بنجاح</p>
              <p className="mt-1 text-sm text-slate-500">سيتواصل معك فريقنا في أقرب وقت.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-card"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" placeholder="الاسم *" required className={FIELD} />
                <input name="email" type="email" placeholder="البريد الإلكتروني *" required className={FIELD} />
              </div>
              <textarea name="message" placeholder="رسالتك *" rows={6} required className={FIELD} />
              {status === "error" && (
                <p className="text-sm text-red-600">تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى.</p>
              )}
              <Button
                type="submit"
                disabled={status === "sending"}
                variant="accent"
                size="lg"
                className={cx("w-full", status === "sending" && "cursor-wait opacity-60")}
              >
                {status === "sending" ? "جارٍ الإرسال…" : "إرسال الرسالة"}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </main>
  );
}
