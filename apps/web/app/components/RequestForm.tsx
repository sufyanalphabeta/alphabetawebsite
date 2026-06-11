import { useState } from "react";
import { createEntry } from "~/lib/strapi";
import type { SoftwareProduct } from "~/lib/types";

const INPUT_STYLE: React.CSSProperties = {
  padding: "0.65rem 0.8rem",
  fontSize: "0.95rem",
  border: "1px solid #d8dde6",
  borderRadius: "0.5rem",
  fontFamily: "inherit",
};

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
    title_en: "Request a Demo",
    intro:    "املأ النموذج وسيتواصل معك فريقنا لترتيب عرض توضيحي مباشر للنظام.",
    subject:  "طلب عرض توضيحي",
    button:   "إرسال طلب العرض التوضيحي",
  },
  quote: {
    title_ar: "اطلب عرض سعر",
    title_en: "Request a Quote",
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
      <div style={{ background: "#f0faf4", border: "1px solid #bfe8cf", borderRadius: "0.75rem", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "#1a7f4b", margin: 0 }}>✓ تم استلام طلبك بنجاح</p>
        <p style={{ color: "#555", margin: "0.5rem 0 0" }}>سيتواصل معك فريقنا في أقرب وقت.</p>
      </div>
    );
  }

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "#0f3460", margin: 0 }}>{copy.title_ar}</h1>
        <p style={{ color: "#aaa", margin: "0.25rem 0 0", fontSize: "0.85rem" }}>{copy.title_en}</p>
        <p style={{ color: "#666", marginTop: "1rem" }}>{copy.intro}</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <select name="product" defaultValue={preselectedSlug ?? ""} style={INPUT_STYLE}>
          <option value="">— اختر النظام (اختياري) —</option>
          {products.map((p) => (
            <option key={p.id} value={p.slug}>{p.name_ar}</option>
          ))}
        </select>
        <input name="name" placeholder="الاسم الكامل *" required style={INPUT_STYLE} />
        <input name="company" placeholder="اسم المؤسسة" style={INPUT_STYLE} />
        <input name="email" type="email" placeholder="البريد الإلكتروني *" required style={INPUT_STYLE} />
        <input name="phone" type="tel" placeholder="رقم الهاتف" style={INPUT_STYLE} />
        <textarea name="message" placeholder="أخبرنا عن احتياجك *" rows={5} required style={INPUT_STYLE} />

        {status === "error" && (
          <p style={{ color: "#c0392b", margin: 0, fontSize: "0.9rem" }}>
            تعذر إرسال الطلب، يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            padding: "0.85rem",
            fontSize: "1rem",
            background: status === "sending" ? "#aab4c4" : "#e94560",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor: status === "sending" ? "wait" : "pointer",
            fontWeight: 600,
          }}
        >
          {status === "sending" ? "جارٍ الإرسال…" : copy.button}
        </button>
      </form>
    </>
  );
}
