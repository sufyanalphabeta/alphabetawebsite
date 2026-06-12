import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { createEntry } from "~/lib/strapi";
import { Button, cx } from "~/components/ui";
import type { SoftwareProduct } from "~/lib/types";

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[0.95rem] text-slate-700 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100";

export interface RequestFormProps {
  /** "demo" | "quote" — controls labels and the submission subject */
  kind: "demo" | "quote";
  products: SoftwareProduct[];
  /** Preselected product slug (from ?product= search param) */
  preselectedSlug?: string;
}

const COPY = {
  demo: {
    title_ar: "اطلب عرضاً توضيحياً",
    title_en: "REQUEST A DEMO",
    intro:    "املأ النموذج وسيتواصل معك فريقنا لترتيب عرض توضيحي مباشر للنظام.",
    subject:  "طلب عرض توضيحي",
    button:   "إرسال طلب العرض التوضيحي",
  },
  quote: {
    title_ar: "اطلب عرض سعر",
    title_en: "REQUEST A QUOTE",
    intro:    "أخبرنا عن احتياجك وسنوافيك بعرض سعر مخصص لمؤسستك.",
    subject:  "طلب عرض سعر",
    button:   "إرسال طلب عرض السعر",
  },
} as const;

export function RequestForm({ kind, products, preselectedSlug }: RequestFormProps) {
  const copy = COPY[kind];
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const productSlug = String(fd.get("product") ?? "");
    const product = products.find((p) => p.slug === productSlug);

    setStatus("sending");
    try {
      await createEntry("contact-submissions", {
        full_name:  String(fd.get("name") ?? ""),
        email:      String(fd.get("email") ?? ""),
        phone:      String(fd.get("phone") ?? "") || null,
        company:    String(fd.get("company") ?? "") || null,
        subject:    product ? `${copy.subject} — ${product.name_ar}` : copy.subject,
        message:    String(fd.get("message") ?? ""),
        source_url: window.location.href,
        locale:     "ar",
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
        <p className="mt-4 text-lg font-bold text-emerald-700">تم استلام طلبك بنجاح</p>
        <p className="mt-1 text-sm text-slate-500">سيتواصل معك فريقنا في أقرب وقت.</p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-accent-600">{copy.title_en}</p>
        <h1 className="mt-1 text-3xl font-bold text-primary-900">{copy.title_ar}</h1>
        <p className="mt-3 text-slate-500">{copy.intro}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-card"
      >
        <select name="product" defaultValue={preselectedSlug ?? ""} className={FIELD}>
          <option value="">— اختر النظام (اختياري) —</option>
          {products.map((p) => (
            <option key={p.id} value={p.slug}>{p.name_ar}</option>
          ))}
        </select>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="الاسم الكامل *" required className={FIELD} />
          <input name="company" placeholder="اسم المؤسسة" className={FIELD} />
          <input name="email" type="email" placeholder="البريد الإلكتروني *" required className={FIELD} />
          <input name="phone" type="tel" placeholder="رقم الهاتف" className={FIELD} />
        </div>
        <textarea name="message" placeholder="أخبرنا عن احتياجك *" rows={5} required className={FIELD} />

        {status === "error" && (
          <p className="text-sm text-red-600">
            تعذر إرسال الطلب، يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "sending"}
          variant="accent"
          size="lg"
          className={cx("w-full", status === "sending" && "cursor-wait opacity-60")}
        >
          {status === "sending" ? "جارٍ الإرسال…" : copy.button}
        </Button>
      </form>
    </>
  );
}
