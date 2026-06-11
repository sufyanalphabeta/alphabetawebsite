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

// ── Sprint 3: rich text blocks (Strapi "blocks" field) ──

export interface BlocksTextNode { type: "text"; text: string; bold?: boolean; italic?: boolean }
export interface BlocksNode {
  type: string;
  children?: Array<BlocksNode | BlocksTextNode>;
  [key: string]: unknown;
}

export interface ProductFeature {
  id: number;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  icon_name: string | null;
  feature_type: "feature" | "capability" | "advantage" | null;
  sort_order: number;
}

export interface ProductModule {
  id: number;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  is_core: boolean;
  sort_order: number;
}

export interface ProductFaq {
  id: number;
  question_ar: string;
  question_en: string | null;
  answer_ar: string | null;
  answer_en: string | null;
  sort_order: number;
}

export interface VideoItem {
  id: number;
  title_ar: string | null;
  title_en: string | null;
  provider: "youtube" | "vimeo" | "internal";
  url: string | null;
  video_file: StrapiFile | null;
  thumbnail: StrapiImage | null;
  sort_order: number;
}

export interface DownloadItem {
  id: number;
  title_ar: string;
  title_en: string | null;
  kind: "brochure" | "datasheet" | "presentation" | "user_guide" | "other";
  file: StrapiFile | null;
  external_url: string | null;
  sort_order: number;
}

export interface StrapiFile {
  id: number;
  url: string;
  name: string;
  ext: string | null;
  size: number;
  mime: string;
}

export interface SeoMeta {
  id: number;
  meta_title_ar: string | null;
  meta_title_en: string | null;
  meta_description_ar: string | null;
  meta_description_en: string | null;
  og_title_ar: string | null;
  og_title_en: string | null;
  og_image: StrapiImage | null;
  canonical_url: string | null;
  no_index: boolean;
  twitter_card: "summary" | "summary_large_image" | null;
}

// ── Sprint 4: trust layer ──

export interface Client {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  logo: StrapiImage | null;
  industry: Industry | null;
  country_ar: string | null;
  country_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  is_featured: boolean;
  sort_order: number;
  software_products: SoftwareProduct[] | null;
  publishedAt: string | null;
}

export interface PartnerType {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  sort_order: number;
}

export interface Partner {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  logo: StrapiImage | null;
  website: string | null;
  description_ar: string | null;
  description_en: string | null;
  partner_type: PartnerType | null;
  is_featured: boolean;
  sort_order: number;
  publishedAt: string | null;
}

export interface Testimonial {
  id: number;
  customer_name_ar: string;
  customer_name_en: string | null;
  position_ar: string | null;
  position_en: string | null;
  company_ar: string | null;
  company_en: string | null;
  text_ar: string;
  text_en: string | null;
  rating: number;
  image: StrapiImage | null;
  client: Client | null;
  is_featured: boolean;
  sort_order: number;
  publishedAt: string | null;
}

export interface SuccessMetric {
  id: number;
  label_ar: string;
  label_en: string | null;
  value: string;
  sort_order: number;
}

export interface SuccessStory {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  client: Client | null;
  software_product: SoftwareProduct | null;
  challenge_ar: string | null;
  challenge_en: string | null;
  solution_ar: string | null;
  solution_en: string | null;
  results_ar: string | null;
  results_en: string | null;
  gallery: StrapiImage[] | null;
  metrics: SuccessMetric[] | null;
  is_featured: boolean;
  sort_order: number;
  publishedAt: string | null;
}

// ── Sprint 5: support & downloads center ──

export interface FaqCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  sort_order: number;
}

export interface FaqItem {
  id: number;
  question_ar: string;
  question_en: string | null;
  answer_ar: string | null;
  answer_en: string | null;
  category: FaqCategory | null;
  software_product: SoftwareProduct | null;
  is_featured: boolean;
  sort_order: number;
  publishedAt: string | null;
}

export interface DownloadCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  sort_order: number;
}

export interface DownloadCenterItem {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  file: StrapiFile | null;
  category: DownloadCategory | null;
  software_product: SoftwareProduct | null;
  language: "ar" | "en" | "both";
  version: string | null;
  release_date: string | null;
  sort_order: number;
  publishedAt: string | null;
}

export interface SupportCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  icon_name: string | null;
  sort_order: number;
}

export interface SupportArticle {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: BlocksNode[] | null;
  body_en: BlocksNode[] | null;
  category: SupportCategory | null;
  software_product: SoftwareProduct | null;
  sort_order: number;
  publishedAt: string | null;
}

export interface SoftwareProductDetail extends SoftwareProduct {
  tagline_ar: string | null;
  tagline_en: string | null;
  long_description_ar: BlocksNode[] | null;
  long_description_en: BlocksNode[] | null;
  main_image: StrapiImage | null;
  screenshots: StrapiImage[] | null;
  industries: Industry[] | null;
  features: ProductFeature[] | null;
  modules: ProductModule[] | null;
  faqs: ProductFaq[] | null;
  videos: VideoItem[] | null;
  downloads: DownloadItem[] | null;
  related_products: SoftwareProduct[] | null;
  clients: Client[] | null;
  success_stories: SuccessStory[] | null;
  seo: SeoMeta | null;
}
