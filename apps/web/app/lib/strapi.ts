import type { StrapiListResponse, StrapiSingleResponse } from "./types";

const BASE_URL = import.meta.env.VITE_STRAPI_URL ?? "http://localhost:1337";

// All content is served via Strapi public permissions — no API token needed in the browser.
// See apps/cms/src/bootstrap/permissions.ts for the full public-read permission list.
async function fetchStrapi<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`/api/${endpoint}`, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Strapi ${res.status}: ${url.pathname}`);
  }

  return res.json() as Promise<T>;
}

export function getCollection<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<StrapiListResponse<T>> {
  return fetchStrapi<StrapiListResponse<T>>(endpoint, params);
}

export function getSingle<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<StrapiSingleResponse<T>> {
  return fetchStrapi<StrapiSingleResponse<T>>(endpoint, params);
}

export async function createEntry<T>(
  endpoint: string,
  data: Record<string, unknown>,
): Promise<T> {
  const url = new URL(`/api/${endpoint}`, BASE_URL);
  const res = await fetch(url.toString(), {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    throw new Error(`Strapi ${res.status}: ${url.pathname}`);
  }
  return res.json() as Promise<T>;
}

/** Resolve a Strapi media URL (local provider returns relative /uploads/… paths). */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return new URL(url, BASE_URL).toString();
}
