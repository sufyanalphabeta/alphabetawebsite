import { createFileRoute } from "@tanstack/react-router";
import { getCollection }   from "~/lib/strapi";
import type { Page }       from "~/lib/types";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    try {
      const res = await getCollection<Page>("pages", {
        "filters[slug][$eq]": "contact",
        "locale":             "ar",
      });
      return { page: res.data[0] ?? null };
    } catch {
      return { page: null };
    }
  },
  component: ContactPage,
});

function ContactPage() {
  const { page } = Route.useLoaderData();

  return (
    <section style={{ padding: "3rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        {page?.title ?? "تواصل معنا"}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          console.log("Contact form:", Object.fromEntries(fd));
        }}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          name="name"
          placeholder="الاسم"
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <input
          name="email"
          type="email"
          placeholder="البريد الإلكتروني"
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <textarea
          name="message"
          placeholder="رسالتك"
          rows={5}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.75rem", fontSize: "1rem", cursor: "pointer" }}>
          إرسال
        </button>
      </form>
    </section>
  );
}
