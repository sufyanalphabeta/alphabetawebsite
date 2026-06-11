import { useEffect } from "react";

export interface SeoOptions {
  title: string;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string;
  canonical?: string | null;
  noIndex?: boolean;
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, unknown> | null;
}

const MANAGED_ATTR = "data-seo-managed";

function setMeta(attr: "name" | "property", key: string, content: string | null | undefined) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string | null | undefined) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown> | null | undefined) {
  const existing = document.head.querySelector(`script[type="application/ld+json"][${MANAGED_ATTR}]`);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute(MANAGED_ATTR, "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Client-side SEO for the SPA: document title, meta description,
 * OpenGraph, Twitter Card, canonical URL, robots, and JSON-LD.
 */
export function useSeo(options: SeoOptions) {
  const serialized = JSON.stringify(options);
  useEffect(() => {
    const opts = JSON.parse(serialized) as SeoOptions;
    document.title = opts.title;
    setMeta("name", "description", opts.description);
    setMeta("name", "robots", opts.noIndex ? "noindex, nofollow" : null);
    setMeta("property", "og:title", opts.ogTitle ?? opts.title);
    setMeta("property", "og:description", opts.ogDescription ?? opts.description);
    setMeta("property", "og:type", opts.ogType ?? "website");
    setMeta("property", "og:image", opts.ogImage);
    setMeta("property", "og:url", opts.canonical ?? window.location.href);
    setMeta("name", "twitter:card", opts.twitterCard ?? "summary_large_image");
    setMeta("name", "twitter:title", opts.ogTitle ?? opts.title);
    setMeta("name", "twitter:description", opts.ogDescription ?? opts.description);
    setMeta("name", "twitter:image", opts.ogImage);
    setCanonical(opts.canonical ?? window.location.href);
    setJsonLd(opts.jsonLd);
    return () => setJsonLd(null);
  }, [serialized]);
}
