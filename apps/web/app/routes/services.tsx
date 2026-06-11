import { createFileRoute } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import type { Service } from "~/lib/types";

export const Route = createFileRoute("/services")({
  loader: async () => {
    try {
      const res = await getCollection<Service>("services", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
      });
      return { services: res.data };
    } catch {
      return { services: [] };
    }
  },
  component: ServicesPage,
});

function ServiceCard({ service }: { service: Service }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "0.75rem",
      padding: "2rem",
      boxShadow: "0 2px 10px rgba(0,0,0,.07)",
      borderTop: service.is_featured ? "3px solid #e94560" : "3px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    }}>
      {service.is_featured && (
        <span style={{
          fontSize: "0.7rem",
          background: "#e94560",
          color: "#fff",
          padding: "0.2rem 0.6rem",
          borderRadius: "999px",
          alignSelf: "flex-start",
          letterSpacing: "0.05em",
        }}>
          مميز
        </span>
      )}
      <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#0f3460" }}>
        {service.name_ar}
      </h2>
      {service.name_en && (
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa", direction: "ltr" }}>
          {service.name_en}
        </p>
      )}
      {service.description_ar && (
        <p style={{ margin: 0, color: "#555", lineHeight: 1.7, fontSize: "0.95rem" }}>
          {service.description_ar}
        </p>
      )}
    </div>
  );
}

function ServicesPage() {
  const { services } = Route.useLoaderData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>
          خدماتنا
        </h1>
        <p style={{ color: "#888" }}>Our Services</p>
      </header>

      {services.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>
          لا توجد خدمات منشورة حالياً
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      )}
    </main>
  );
}
