import { createFileRoute, Link } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import type { SoftwareProduct } from "~/lib/types";

export const Route = createFileRoute("/software")({
  loader: async () => {
    try {
      const res = await getCollection<SoftwareProduct>("software-products", {
        "sort[0]":    "sort_order:asc",
        "populate[0]": "category",
        "filters[publishedAt][$notNull]": "true",
      });
      return { products: res.data };
    } catch {
      return { products: [] };
    }
  },
  component: SoftwarePage,
});

function ProductCard({ product }: { product: SoftwareProduct }) {
  return (
    <article style={{
      background: "#fff",
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,.08)",
      display: "flex",
      flexDirection: "column",
      border: product.is_featured ? "2px solid #e94560" : "1px solid #eef0f4",
    }}>
      <div style={{
        background: product.is_featured ? "#0f3460" : "#f8f9fa",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "0.5rem",
          background: product.is_featured ? "rgba(255,255,255,.15)" : "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}>
          💻
        </div>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: "1.1rem",
            color: product.is_featured ? "#fff" : "#0f3460",
          }}>
            {product.name_ar}
          </h2>
          {product.name_en && (
            <p style={{
              margin: 0,
              fontSize: "0.75rem",
              color: product.is_featured ? "rgba(255,255,255,.65)" : "#aaa",
              direction: "ltr",
            }}>
              {product.name_en}
            </p>
          )}
        </div>
        {product.is_featured && (
          <span style={{
            marginRight: "auto",
            fontSize: "0.65rem",
            background: "#e94560",
            color: "#fff",
            padding: "0.2rem 0.5rem",
            borderRadius: "999px",
          }}>
            مميز
          </span>
        )}
      </div>

      <div style={{ padding: "1.25rem 1.5rem", flex: 1 }}>
        {product.short_description_ar && (
          <p style={{ margin: 0, color: "#555", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {product.short_description_ar}
          </p>
        )}
        {product.category && (
          <div style={{ marginTop: "1rem" }}>
            <span style={{
              fontSize: "0.75rem",
              background: "#eef0f4",
              color: "#0f3460",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
            }}>
              {product.category.name_ar}
            </span>
          </div>
        )}
        <div style={{ marginTop: "1rem" }}>
          <Link
            to="/software/$slug"
            params={{ slug: product.slug }}
            style={{ fontSize: "0.85rem", color: "#e94560", textDecoration: "none", fontWeight: 600 }}
          >
            عرض التفاصيل ←
          </Link>
        </div>
      </div>
    </article>
  );
}

function SoftwarePage() {
  const { products } = Route.useLoaderData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#0f3460", marginBottom: "0.5rem" }}>
          منظومة البرمجيات
        </h1>
        <p style={{ color: "#888" }}>Software Hub</p>
      </header>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", padding: "4rem 0" }}>
          لا توجد منتجات منشورة حالياً
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </main>
  );
}
