export interface StrapiLocale { en: string; ar: string }

export interface StrapiMeta {
  pagination?: { page: number; pageSize: number; pageCount: number; total: number };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
}

export interface SiteSetting {
  id: number;
  site_name_ar: string;
  site_name_en: string;
  tagline_ar: string | null;
  tagline_en: string | null;
  phone_primary: string | null;
  primary_email: string | null;
  default_locale: "ar" | "en";
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  locale: string;
  publishedAt: string | null;
}

export interface CompanyProfile {
  id: number;
  about_ar: unknown | null;
  about_en: unknown | null;
  vision_ar: string | null;
  vision_en: string | null;
  mission_ar: string | null;
  mission_en: string | null;
  values_ar: unknown | null;
  values_en: unknown | null;
  founded_year: number | null;
  employee_count: number | null;
  headquarters_ar: string | null;
  headquarters_en: string | null;
  hero_image: StrapiImage | null;
  publishedAt: string | null;
}

export interface Service {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  icon_name: string | null;
  sort_order: number;
  is_featured: boolean;
  publishedAt: string | null;
}

export interface Industry {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  publishedAt: string | null;
}

export interface ProductCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  sort_order: number;
}

export interface SoftwareProduct {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  short_description_ar: string | null;
  short_description_en: string | null;
  is_featured: boolean;
  sort_order: number;
  logo: StrapiImage | null;
  category: ProductCategory | null;
  publishedAt: string | null;
}
