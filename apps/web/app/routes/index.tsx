import { createFileRoute } from "@tanstack/react-router";
import { getSingle }       from "~/lib/strapi";
import type { SiteSetting } from "~/lib/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await getSingle<SiteSetting>("site-setting", { locale: "ar" });
      return { setting: res.data };
    } catch {
      return { setting: null };
    }
  },
  component: HomePage,
});

function HomePage() {
  const { setting } = Route.useLoaderData();

  return (
    <section style={{ padding: "3rem 2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        {setting?.site_name_ar ?? "ألفا بيتا"}
      </h1>
      {setting?.tagline_ar && (
        <p style={{ fontSize: "1.25rem", color: "#555" }}>{setting.tagline_ar}</p>
      )}
    </section>
  );
}
