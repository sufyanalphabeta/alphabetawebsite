import { createFileRoute } from "@tanstack/react-router";
import { getCollection } from "~/lib/strapi";
import { useSeo } from "~/lib/seo";
import { RequestForm } from "~/components/RequestForm";
import type { SoftwareProduct } from "~/lib/types";

export const Route = createFileRoute("/request-demo")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => ({
    product: typeof search.product === "string" ? search.product : undefined,
  }),
  loader: async () => {
    try {
      const res = await getCollection<SoftwareProduct>("software-products", {
        "sort[0]": "sort_order:asc",
        "filters[publishedAt][$notNull]": "true",
      });
      return { products: res.data };
    } catch {
      return { products: [] };
    }
  },
  component: RequestDemoPage,
});

function RequestDemoPage() {
  const { products } = Route.useLoaderData();
  const { product }  = Route.useSearch();

  useSeo({
    title:       "اطلب عرضاً توضيحياً | ألفا بيتا",
    description: "اطلب عرضاً توضيحياً مباشراً لأنظمة ألفا بيتا البرمجية",
  });

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <RequestForm kind="demo" products={products} preselectedSlug={product} />
    </main>
  );
}
