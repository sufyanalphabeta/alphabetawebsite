import type { Core } from "@strapi/strapi";

export async function bootstrapSeed(strapi: Core.Strapi) {
  try {
    await seedSiteSetting(strapi);
    await seedCompanyProfile(strapi);
    await seedProductCategories(strapi);
    await seedIndustries(strapi);
    await seedServices(strapi);
    await seedSoftwareProducts(strapi);
    strapi.log.info("[bootstrap:seed] ✓ Seed ready");
  } catch (err) {
    strapi.log.warn(`[bootstrap:seed] ⚠ ${String(err)}`);
  }
}

async function seedSiteSetting(strapi: Core.Strapi) {
  const q = strapi.db.query("api::site-setting.site-setting");
  const existing = await q.findOne({}) as { id: number; site_name_ar?: string } | null;
  if (existing?.site_name_ar) return;
  if (existing) {
    await q.delete({ where: { id: existing.id } });
  }
  await q.create({
    data: {
      site_name_ar:   "ألفا بيتا",
      site_name_en:   "AlphaBeta",
      tagline_ar:     "نصنع البرمجيات، نبني المستقبل",
      tagline_en:     "We build software, we build the future",
      phone_primary:  "+218 91 000 0000",
      primary_email:  "info@alphabeta.ly",
      default_locale: "ar",
    },
  });
  strapi.log.info("[bootstrap:seed] Created default site-setting");
}

async function seedCompanyProfile(strapi: Core.Strapi) {
  const q = strapi.db.query("api::company-profile.company-profile");
  const existing = await q.findOne({}) as { id: number; vision_ar?: string } | null;
  if (existing?.vision_ar) return;
  if (existing) {
    await q.delete({ where: { id: existing.id } });
  }
  await q.create({
    data: {
      vision_ar:        "أن نكون الشريك التقني الأول لتحويل الأعمال الليبية رقمياً",
      vision_en:        "To be the premier technology partner for digital transformation in Libya",
      mission_ar:       "نبني حلولاً برمجية متكاملة تُمكّن المؤسسات من تحقيق أهدافها وتطوير أعمالها",
      mission_en:       "We build integrated software solutions that empower organizations to achieve their goals",
      founded_year:     2015,
      employee_count:   50,
      headquarters_ar:  "طرابلس، ليبيا",
      headquarters_en:  "Tripoli, Libya",
      publishedAt:      new Date().toISOString(),
    },
  });
  strapi.log.info("[bootstrap:seed] Created default company-profile");
}

async function seedProductCategories(strapi: Core.Strapi) {
  const q = strapi.db.query("api::product-category.product-category");
  const count = await q.count({});
  if (count > 0) return;
  const categories = [
    { name_ar: "إدارة الموارد البشرية", name_en: "Human Resources", slug: "hr", sort_order: 1 },
    { name_ar: "المحاسبة والمالية",      name_en: "Accounting & Finance", slug: "accounting", sort_order: 2 },
    { name_ar: "إدارة العلاقات",         name_en: "CRM", slug: "crm", sort_order: 3 },
    { name_ar: "التجارة الإلكترونية",    name_en: "E-Commerce", slug: "ecommerce", sort_order: 4 },
  ];
  for (const cat of categories) {
    await q.create({ data: cat });
  }
  strapi.log.info(`[bootstrap:seed] Created ${categories.length} product categories`);
}

async function seedIndustries(strapi: Core.Strapi) {
  const q = strapi.db.query("api::industry.industry");
  const count = await q.count({});
  if (count > 0) return;
  const industries = [
    { name_ar: "التجزئة والتجارة",      name_en: "Retail & Commerce",    slug: "retail",       sort_order: 1, publishedAt: new Date().toISOString() },
    { name_ar: "الرعاية الصحية",        name_en: "Healthcare",           slug: "healthcare",   sort_order: 2, publishedAt: new Date().toISOString() },
    { name_ar: "التعليم",               name_en: "Education",            slug: "education",    sort_order: 3, publishedAt: new Date().toISOString() },
    { name_ar: "الخدمات الحكومية",      name_en: "Government Services",  slug: "government",   sort_order: 4, publishedAt: new Date().toISOString() },
    { name_ar: "البناء والمقاولات",     name_en: "Construction",         slug: "construction", sort_order: 5, publishedAt: new Date().toISOString() },
  ];
  for (const ind of industries) {
    await q.create({ data: ind });
  }
  strapi.log.info(`[bootstrap:seed] Created ${industries.length} industries`);
}

async function seedServices(strapi: Core.Strapi) {
  const q = strapi.db.query("api::service.service");
  const count = await q.count({});
  if (count > 0) return;
  const services = [
    {
      name_ar:        "تطوير البرمجيات المخصصة",
      name_en:        "Custom Software Development",
      slug:           "custom-software-development",
      description_ar: "نبني تطبيقات مخصصة تلبي احتياجاتك التشغيلية الفريدة",
      description_en: "We build tailored applications that meet your unique operational needs",
      is_featured:    true,
      sort_order:     1,
      publishedAt:    new Date().toISOString(),
    },
    {
      name_ar:        "استشارات التحول الرقمي",
      name_en:        "Digital Transformation Consulting",
      slug:           "digital-transformation-consulting",
      description_ar: "نرافقك في رحلة التحول الرقمي من التخطيط حتى التنفيذ",
      description_en: "We guide you through your digital transformation journey from planning to execution",
      is_featured:    true,
      sort_order:     2,
      publishedAt:    new Date().toISOString(),
    },
    {
      name_ar:        "الدعم الفني والصيانة",
      name_en:        "Technical Support & Maintenance",
      slug:           "technical-support-maintenance",
      description_ar: "فريق دعم متخصص لضمان استمرارية أعمالك على مدار الساعة",
      description_en: "Dedicated support team ensuring your business runs 24/7 without interruption",
      is_featured:    false,
      sort_order:     3,
      publishedAt:    new Date().toISOString(),
    },
    {
      name_ar:        "تدريب وتأهيل الكوادر",
      name_en:        "Training & Staff Development",
      slug:           "training-staff-development",
      description_ar: "برامج تدريبية احترافية لتمكين فريق عملك من استخدام التقنية بكفاءة",
      description_en: "Professional training programs to empower your team to use technology efficiently",
      is_featured:    false,
      sort_order:     4,
      publishedAt:    new Date().toISOString(),
    },
  ];
  for (const svc of services) {
    await q.create({ data: svc });
  }
  strapi.log.info(`[bootstrap:seed] Created ${services.length} services`);
}

async function seedSoftwareProducts(strapi: Core.Strapi) {
  const q = strapi.db.query("api::software-product.software-product");
  const count = await q.count({});
  if (count > 0) return;

  const catQ = strapi.db.query("api::product-category.product-category");
  const hrCat    = await catQ.findOne({ where: { slug: "hr" } })        as { id: number } | null;
  const accCat   = await catQ.findOne({ where: { slug: "accounting" } }) as { id: number } | null;

  const products = [
    {
      name_ar:              "نظام إدارة الموارد البشرية",
      name_en:              "HR Management System",
      slug:                 "hr-management-system",
      short_description_ar: "حل متكامل لإدارة شؤون الموظفين والرواتب والإجازات",
      short_description_en: "Comprehensive solution for managing employees, payroll, and leave",
      is_featured:          true,
      sort_order:           1,
      category:             hrCat?.id ?? null,
      publishedAt:          new Date().toISOString(),
    },
    {
      name_ar:              "نظام المحاسبة والمالية",
      name_en:              "Accounting & Finance System",
      slug:                 "accounting-finance-system",
      short_description_ar: "نظام محاسبي شامل يدعم المعايير الليبية والدولية",
      short_description_en: "Comprehensive accounting system supporting Libyan and international standards",
      is_featured:          true,
      sort_order:           2,
      category:             accCat?.id ?? null,
      publishedAt:          new Date().toISOString(),
    },
    {
      name_ar:              "منصة التجارة الإلكترونية",
      name_en:              "E-Commerce Platform",
      slug:                 "ecommerce-platform",
      short_description_ar: "منصة متكاملة لإدارة المتجر الإلكتروني والمبيعات عبر الإنترنت",
      short_description_en: "Integrated platform for managing your online store and e-commerce operations",
      is_featured:          false,
      sort_order:           3,
      category:             null,
      publishedAt:          new Date().toISOString(),
    },
  ];

  for (const prod of products) {
    await q.create({ data: prod });
  }
  strapi.log.info(`[bootstrap:seed] Created ${products.length} software products`);
}
