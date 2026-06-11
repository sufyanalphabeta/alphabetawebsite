import type { Core } from "@strapi/strapi";
import { mkdtemp, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function bootstrapSeed(strapi: Core.Strapi) {
  try {
    await seedSiteSetting(strapi);
    await seedCompanyProfile(strapi);
    await seedProductCategories(strapi);
    await seedIndustries(strapi);
    await seedServices(strapi);
    await seedSoftwareProducts(strapi);
    await seedSprint3Products(strapi);
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

// ────────────────────────────── Sprint 3 ──────────────────────────────

function blocks(text: string) {
  return [{ type: "paragraph", children: [{ type: "text", text }] }];
}

function placeholderSvg(label: string, bg: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <rect width="1280" height="800" fill="${bg}"/>
  <rect x="40" y="40" width="1200" height="80" rx="12" fill="rgba(255,255,255,.12)"/>
  <rect x="40" y="160" width="380" height="600" rx="12" fill="rgba(255,255,255,.08)"/>
  <rect x="460" y="160" width="780" height="280" rx="12" fill="rgba(255,255,255,.10)"/>
  <rect x="460" y="480" width="780" height="280" rx="12" fill="rgba(255,255,255,.08)"/>
  <text x="640" y="416" text-anchor="middle" font-family="Arial" font-size="44" fill="#ffffff">${label}</text>
</svg>`;
}

async function uploadSvg(
  strapi: Core.Strapi,
  dir: string,
  fileName: string,
  svg: string,
  ref: { refId: number; field: string },
) {
  const filepath = path.join(dir, fileName);
  await writeFile(filepath, svg, "utf8");
  const { size } = await stat(filepath);
  await strapi.plugin("upload").service("upload").upload({
    data: {
      ref:   "api::software-product.software-product",
      refId: ref.refId,
      field: ref.field,
      fileInfo: { name: fileName, alternativeText: fileName.replace(/\.svg$/, "") },
    },
    files: { filepath, originalFilename: fileName, mimetype: "image/svg+xml", size },
  });
}

interface Sprint3Feature {
  title_ar: string; title_en: string;
  description_ar: string; description_en: string;
  icon_name: string; feature_type: "feature" | "capability" | "advantage";
}
interface Sprint3Module {
  name_ar: string; name_en: string;
  description_ar: string; description_en: string; is_core: boolean;
}
interface Sprint3Faq {
  question_ar: string; question_en: string;
  answer_ar: string; answer_en: string;
}
interface Sprint3Product {
  name_ar: string; name_en: string; slug: string;
  tagline_ar: string; tagline_en: string;
  short_description_ar: string; short_description_en: string;
  long_description_ar: string; long_description_en: string;
  is_featured: boolean; sort_order: number;
  category_slug: string; industry_slugs: string[];
  accent: string;
  features: Sprint3Feature[];
  modules: Sprint3Module[];
  faqs: Sprint3Faq[];
}

async function seedSprint3Products(strapi: Core.Strapi) {
  const productQ = strapi.db.query("api::software-product.software-product");
  const sentinel = await productQ.findOne({ where: { slug: "insurance-management-system" } });
  if (sentinel) return;

  const now = () => new Date().toISOString();

  // Extra industries needed by Sprint 3 demo content
  const industryQ = strapi.db.query("api::industry.industry");
  const extraIndustries = [
    { name_ar: "التأمين",              name_en: "Insurance", slug: "insurance", sort_order: 6, publishedAt: now() },
    { name_ar: "المنظمات غير الربحية", name_en: "NGOs",      slug: "ngo",       sort_order: 7, publishedAt: now() },
  ];
  for (const ind of extraIndustries) {
    const existing = await industryQ.findOne({ where: { slug: ind.slug } });
    if (!existing) await industryQ.create({ data: ind });
  }

  // Extra categories
  const catQ = strapi.db.query("api::product-category.product-category");
  const extraCategories = [
    { name_ar: "أنظمة التأمين",          name_en: "Insurance Systems",  slug: "insurance-systems", sort_order: 5 },
    { name_ar: "الأنظمة الطبية",          name_en: "Healthcare Systems", slug: "medical-systems",   sort_order: 6 },
    { name_ar: "تخطيط موارد المؤسسات",   name_en: "ERP Systems",        slug: "erp-systems",       sort_order: 7 },
  ];
  for (const cat of extraCategories) {
    const existing = await catQ.findOne({ where: { slug: cat.slug } });
    if (!existing) await catQ.create({ data: cat });
  }

  const industryIds = async (slugs: string[]) => {
    const ids: number[] = [];
    for (const slug of slugs) {
      const ind = await industryQ.findOne({ where: { slug } }) as { id: number } | null;
      if (ind) ids.push(ind.id);
    }
    return ids;
  };

  const products: Sprint3Product[] = [
    {
      name_ar: "نظام إدارة التأمين", name_en: "Insurance Management System",
      slug: "insurance-management-system",
      tagline_ar: "إدارة شاملة لشركات التأمين من الوثيقة حتى المطالبة",
      tagline_en: "End-to-end management for insurers, from policy to claim",
      short_description_ar: "نظام متكامل لإدارة وثائق التأمين والمطالبات والموافقات والتقارير",
      short_description_en: "Integrated system for managing insurance policies, claims, approvals, and reporting",
      long_description_ar: "نظام إدارة التأمين من ألفا بيتا هو منصة متكاملة تغطي دورة حياة التأمين بالكامل: إصدار الوثائق، إدارة المطالبات، الموافقات الطبية، التسويات المالية، وإدارة شبكة مزودي الخدمة. صُمم النظام ليتوافق مع متطلبات السوق الليبي مع دعم كامل للغة العربية.",
      long_description_en: "AlphaBeta's Insurance Management System is an integrated platform covering the full insurance lifecycle: policy issuance, claims management, medical approvals, financial settlements, and provider network management. Built for the Libyan market with full Arabic support.",
      is_featured: true, sort_order: 1,
      category_slug: "insurance-systems",
      industry_slugs: ["insurance", "healthcare", "government"],
      accent: "#0f3460",
      features: [
        { title_ar: "إدارة المطالبات", title_en: "Claims Management", description_ar: "دورة كاملة للمطالبات من التسجيل حتى التسوية مع تتبع لحظي للحالة", description_en: "Full claims lifecycle from registration to settlement with real-time status tracking", icon_name: "file-check", feature_type: "feature" },
        { title_ar: "إدارة الوثائق", title_en: "Policy Management", description_ar: "إصدار وتجديد وإلغاء وثائق التأمين بمختلف أنواعها", description_en: "Issue, renew, and cancel insurance policies of all types", icon_name: "file-text", feature_type: "feature" },
        { title_ar: "إدارة الموافقات", title_en: "Approvals Management", description_ar: "سير عمل مرن للموافقات الطبية والإدارية متعدد المستويات", description_en: "Flexible multi-level workflow for medical and administrative approvals", icon_name: "check-circle", feature_type: "feature" },
        { title_ar: "التقارير الذكية", title_en: "Smart Reports", description_ar: "لوحات تحكم وتقارير تحليلية تدعم اتخاذ القرار", description_en: "Dashboards and analytical reports that support decision-making", icon_name: "bar-chart", feature_type: "capability" },
        { title_ar: "تكامل مع مزودي الخدمة", title_en: "Provider Integration", description_ar: "ربط إلكتروني مع المستشفيات والعيادات والصيدليات", description_en: "Electronic integration with hospitals, clinics, and pharmacies", icon_name: "link", feature_type: "capability" },
        { title_ar: "جاهز للسوق الليبي", title_en: "Built for Libya", description_ar: "متوافق مع اللوائح المحلية وبدعم عربي كامل", description_en: "Compliant with local regulations and fully Arabic-first", icon_name: "map-pin", feature_type: "advantage" },
      ],
      modules: [
        { name_ar: "وحدة المطالبات", name_en: "Claims Module", description_ar: "تسجيل ومعالجة وتسوية المطالبات", description_en: "Register, process, and settle claims", is_core: true },
        { name_ar: "وحدة الوثائق", name_en: "Policy Module", description_ar: "إدارة دورة حياة وثائق التأمين", description_en: "Manage the policy lifecycle", is_core: true },
        { name_ar: "الوحدة المالية", name_en: "Finance Module", description_ar: "التسويات والفوترة والتحصيل", description_en: "Settlements, invoicing, and collections", is_core: true },
        { name_ar: "وحدة مزودي الخدمة", name_en: "Provider Module", description_ar: "إدارة شبكة المستشفيات والعيادات", description_en: "Manage the hospital and clinic network", is_core: false },
        { name_ar: "وحدة التقارير", name_en: "Reports Module", description_ar: "تقارير تشغيلية وتحليلية", description_en: "Operational and analytical reporting", is_core: false },
      ],
      faqs: [
        { question_ar: "هل يدعم النظام التأمين الطبي والتأمين على المركبات؟", question_en: "Does the system support both medical and motor insurance?", answer_ar: "نعم، النظام يدعم جميع فروع التأمين من خلال إعدادات مرنة لأنواع الوثائق والتغطيات.", answer_en: "Yes, the system supports all insurance lines through flexible policy and coverage configuration." },
        { question_ar: "هل يمكن ربط النظام مع مزودي الخدمة الطبية؟", question_en: "Can the system integrate with medical providers?", answer_ar: "نعم، توفر وحدة مزودي الخدمة ربطاً إلكترونياً مع المستشفيات والعيادات والصيدليات.", answer_en: "Yes, the Provider Module offers electronic integration with hospitals, clinics, and pharmacies." },
        { question_ar: "هل النظام سحابي أم محلي؟", question_en: "Is the system cloud-based or on-premise?", answer_ar: "يمكن نشر النظام سحابياً أو على خوادم العميل حسب متطلبات المؤسسة.", answer_en: "The system can be deployed in the cloud or on-premise depending on your requirements." },
      ],
    },
    {
      name_ar: "نظام الإدارة الطبية", name_en: "Medical Management System",
      slug: "medical-management-system",
      tagline_ar: "إدارة المنشآت الصحية بكفاءة من الاستقبال حتى الفوترة",
      tagline_en: "Run healthcare facilities efficiently, from reception to billing",
      short_description_ar: "نظام شامل لإدارة المستشفيات والعيادات: المواعيد، الملفات الطبية، المختبر، والفوترة",
      short_description_en: "Comprehensive hospital and clinic management: appointments, medical records, lab, and billing",
      long_description_ar: "نظام الإدارة الطبية يوفر منصة موحدة لإدارة المنشآت الصحية: حجز المواعيد، الملف الطبي الإلكتروني، إدارة المختبر والصيدلية، والفوترة والتأمين. يضمن النظام تجربة سلسة للمريض وكفاءة تشغيلية عالية للمنشأة.",
      long_description_en: "The Medical Management System provides a unified platform for healthcare facilities: appointment scheduling, electronic medical records, lab and pharmacy management, and billing with insurance integration. It ensures a smooth patient experience and high operational efficiency.",
      is_featured: true, sort_order: 2,
      category_slug: "medical-systems",
      industry_slugs: ["healthcare", "insurance", "ngo"],
      accent: "#16697a",
      features: [
        { title_ar: "الملف الطبي الإلكتروني", title_en: "Electronic Medical Records", description_ar: "سجل طبي موحد للمريض يشمل التاريخ المرضي والوصفات والفحوصات", description_en: "Unified patient record covering history, prescriptions, and tests", icon_name: "folder-heart", feature_type: "feature" },
        { title_ar: "إدارة المواعيد", title_en: "Appointment Scheduling", description_ar: "حجز وتنظيم المواعيد مع تذكيرات تلقائية", description_en: "Book and organize appointments with automatic reminders", icon_name: "calendar", feature_type: "feature" },
        { title_ar: "إدارة المختبر", title_en: "Lab Management", description_ar: "طلبات الفحوصات والنتائج مرتبطة مباشرة بملف المريض", description_en: "Test orders and results linked directly to the patient record", icon_name: "flask", feature_type: "feature" },
        { title_ar: "الفوترة والتأمين", title_en: "Billing & Insurance", description_ar: "فوترة مرنة مع دعم مطالبات التأمين الصحي", description_en: "Flexible billing with health-insurance claim support", icon_name: "receipt", feature_type: "capability" },
        { title_ar: "تقارير الأداء", title_en: "Performance Reports", description_ar: "مؤشرات تشغيلية ومالية للمنشأة الصحية", description_en: "Operational and financial KPIs for the facility", icon_name: "bar-chart", feature_type: "capability" },
        { title_ar: "خصوصية وأمان البيانات", title_en: "Data Privacy & Security", description_ar: "صلاحيات دقيقة وتشفير يحمي بيانات المرضى", description_en: "Granular permissions and encryption protecting patient data", icon_name: "shield", feature_type: "advantage" },
      ],
      modules: [
        { name_ar: "وحدة المواعيد", name_en: "Appointments Module", description_ar: "إدارة جداول الأطباء والحجوزات", description_en: "Manage physician schedules and bookings", is_core: true },
        { name_ar: "وحدة الملفات الطبية", name_en: "Medical Records Module", description_ar: "السجل الطبي الإلكتروني الموحد", description_en: "Unified electronic medical records", is_core: true },
        { name_ar: "وحدة المختبر", name_en: "Lab Module", description_ar: "إدارة الفحوصات والنتائج", description_en: "Manage tests and results", is_core: false },
        { name_ar: "وحدة الصيدلية", name_en: "Pharmacy Module", description_ar: "إدارة الأدوية والمخزون الدوائي", description_en: "Manage medications and pharmacy inventory", is_core: false },
        { name_ar: "وحدة الفوترة", name_en: "Billing Module", description_ar: "الفوترة والتحصيل ومطالبات التأمين", description_en: "Billing, collections, and insurance claims", is_core: true },
      ],
      faqs: [
        { question_ar: "هل يناسب النظام العيادات الصغيرة؟", question_en: "Is the system suitable for small clinics?", answer_ar: "نعم، النظام معياري ويمكن تفعيل الوحدات حسب حجم المنشأة بدءاً من عيادة واحدة.", answer_en: "Yes, the system is modular — enable only the modules you need, starting from a single clinic." },
        { question_ar: "هل يتكامل النظام مع نظام إدارة التأمين؟", question_en: "Does it integrate with the Insurance Management System?", answer_ar: "نعم، يتكامل النظامان مباشرة لمعالجة الموافقات والمطالبات إلكترونياً.", answer_en: "Yes, the two systems integrate directly to process approvals and claims electronically." },
        { question_ar: "هل يدعم النظام أجهزة المختبر؟", question_en: "Does the system support lab devices?", answer_ar: "يوفر النظام واجهات ربط مع أجهزة المختبرات المتوافقة مع المعايير القياسية.", answer_en: "The system offers interfaces for lab devices that follow standard protocols." },
      ],
    },
    {
      name_ar: "نظام تخطيط موارد المؤسسات", name_en: "ERP System",
      slug: "erp-system",
      tagline_ar: "منصة واحدة لإدارة المالية والمخزون والمشتريات والموارد البشرية",
      tagline_en: "One platform for finance, inventory, procurement, and HR",
      short_description_ar: "نظام ERP متكامل يوحد العمليات المالية والإدارية في منصة واحدة",
      short_description_en: "Integrated ERP unifying financial and administrative operations in one platform",
      long_description_ar: "نظام تخطيط موارد المؤسسات من ألفا بيتا يجمع الإدارة المالية والمخزون والمشتريات والمبيعات والموارد البشرية في منصة واحدة مترابطة. صُمم النظام ليتدرج مع نمو مؤسستك ويدعم تعدد الفروع والعملات.",
      long_description_en: "AlphaBeta's ERP brings finance, inventory, procurement, sales, and HR together in one connected platform. Designed to scale with your organization, with multi-branch and multi-currency support.",
      is_featured: false, sort_order: 3,
      category_slug: "erp-systems",
      industry_slugs: ["retail", "construction", "government", "ngo"],
      accent: "#533483",
      features: [
        { title_ar: "إدارة مالية متكاملة", title_en: "Integrated Financials", description_ar: "دليل حسابات مرن وقيود تلقائية وتقارير مالية فورية", description_en: "Flexible chart of accounts, automatic entries, and instant financial reports", icon_name: "wallet", feature_type: "feature" },
        { title_ar: "إدارة المخزون", title_en: "Inventory Management", description_ar: "تتبع المخزون عبر مستودعات وفروع متعددة", description_en: "Track inventory across multiple warehouses and branches", icon_name: "package", feature_type: "feature" },
        { title_ar: "المشتريات والموردون", title_en: "Procurement & Vendors", description_ar: "دورة مشتريات كاملة من طلب الشراء حتى الاستلام والدفع", description_en: "Full procurement cycle from purchase request to receipt and payment", icon_name: "shopping-cart", feature_type: "feature" },
        { title_ar: "تعدد الفروع والعملات", title_en: "Multi-branch & Multi-currency", description_ar: "إدارة موحدة لفروع متعددة وبعملات مختلفة", description_en: "Unified management of multiple branches and currencies", icon_name: "globe", feature_type: "capability" },
        { title_ar: "سير عمل وموافقات", title_en: "Workflows & Approvals", description_ar: "موافقات إلكترونية قابلة للتخصيص لكل العمليات", description_en: "Customizable electronic approvals across all operations", icon_name: "git-branch", feature_type: "capability" },
        { title_ar: "قابل للتوسع", title_en: "Scales With You", description_ar: "بنية معيارية تنمو مع المؤسسة دون إعادة بناء", description_en: "Modular architecture that grows with the organization without re-implementation", icon_name: "trending-up", feature_type: "advantage" },
      ],
      modules: [
        { name_ar: "الوحدة المالية", name_en: "Finance Module", description_ar: "الحسابات العامة والقيود والتقارير", description_en: "General ledger, entries, and reports", is_core: true },
        { name_ar: "وحدة المخزون", name_en: "Inventory Module", description_ar: "إدارة الأصناف والمستودعات", description_en: "Items and warehouse management", is_core: true },
        { name_ar: "وحدة المشتريات", name_en: "Procurement Module", description_ar: "دورة المشتريات والموردين", description_en: "Procurement and vendor cycle", is_core: true },
        { name_ar: "وحدة المبيعات", name_en: "Sales Module", description_ar: "الفواتير والعروض وإدارة العملاء", description_en: "Invoices, quotations, and customer management", is_core: false },
        { name_ar: "وحدة الموارد البشرية", name_en: "HR Module", description_ar: "الموظفون والرواتب والإجازات", description_en: "Employees, payroll, and leave", is_core: false },
      ],
      faqs: [
        { question_ar: "هل يمكن ترحيل بياناتنا من نظامنا الحالي؟", question_en: "Can we migrate data from our current system?", answer_ar: "نعم، يشمل التنفيذ خطة ترحيل بيانات كاملة للأرصدة والأصناف والعملاء والموردين.", answer_en: "Yes, implementation includes a full data-migration plan for balances, items, customers, and vendors." },
        { question_ar: "كم يستغرق تنفيذ النظام؟", question_en: "How long does implementation take?", answer_ar: "يعتمد على حجم المؤسسة والوحدات المطلوبة، وعادة من 8 إلى 16 أسبوعاً.", answer_en: "It depends on organization size and modules, typically 8–16 weeks." },
        { question_ar: "هل يرتبط النظام بنظام الموارد البشرية المستقل؟", question_en: "Does it integrate with the standalone HR system?", answer_ar: "نعم، يتكامل مع منتجات ألفا بيتا الأخرى ومع الأنظمة الخارجية عبر واجهات برمجية.", answer_en: "Yes, it integrates with other AlphaBeta products and external systems via APIs." },
      ],
    },
  ];

  const featureQ = strapi.db.query("api::product-feature.product-feature");
  const moduleQ  = strapi.db.query("api::product-module.product-module");
  const faqQ     = strapi.db.query("api::product-faq.product-faq");

  const createdIds: Record<string, number> = {};
  const tmpDir = await mkdtemp(path.join(tmpdir(), "ab-seed-"));

  try {
    for (const p of products) {
      const cat = await catQ.findOne({ where: { slug: p.category_slug } }) as { id: number } | null;
      const indIds = await industryIds(p.industry_slugs);

      const created = await productQ.create({
        data: {
          name_ar: p.name_ar, name_en: p.name_en, slug: p.slug,
          tagline_ar: p.tagline_ar, tagline_en: p.tagline_en,
          short_description_ar: p.short_description_ar,
          short_description_en: p.short_description_en,
          long_description_ar: blocks(p.long_description_ar),
          long_description_en: blocks(p.long_description_en),
          is_featured: p.is_featured, sort_order: p.sort_order,
          category: cat?.id ?? null,
          industries: indIds,
          publishedAt: now(),
        },
      }) as { id: number };
      createdIds[p.slug] = created.id;

      let order = 1;
      for (const f of p.features) {
        await featureQ.create({ data: { ...f, sort_order: order++, product: created.id } });
      }
      order = 1;
      for (const m of p.modules) {
        await moduleQ.create({ data: { ...m, sort_order: order++, product: created.id } });
      }
      order = 1;
      for (const faq of p.faqs) {
        await faqQ.create({ data: { ...faq, sort_order: order++, product: created.id } });
      }

      // Placeholder screenshots + logo (SVG)
      try {
        for (let i = 1; i <= 3; i++) {
          await uploadSvg(
            strapi, tmpDir, `${p.slug}-screenshot-${i}.svg`,
            placeholderSvg(`${p.name_en} — Screen ${i}`, p.accent),
            { refId: created.id, field: "screenshots" },
          );
        }
        await uploadSvg(
          strapi, tmpDir, `${p.slug}-logo.svg`,
          `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" rx="48" fill="${p.accent}"/><text x="128" y="148" text-anchor="middle" font-family="Arial" font-size="64" fill="#fff">${p.name_en.split(" ").map((w) => w[0]).slice(0, 2).join("")}</text></svg>`,
          { refId: created.id, field: "logo" },
        );
      } catch (err) {
        strapi.log.warn(`[bootstrap:seed] ⚠ media upload for ${p.slug}: ${String(err)}`);
      }
    }

    // Related products (cross-link the three systems)
    const rel: Record<string, string[]> = {
      "insurance-management-system": ["medical-management-system", "erp-system"],
      "medical-management-system":   ["insurance-management-system", "erp-system"],
      "erp-system":                  ["insurance-management-system", "medical-management-system"],
    };
    for (const [slug, related] of Object.entries(rel)) {
      await productQ.update({
        where: { id: createdIds[slug] },
        data:  { related_products: related.map((s) => createdIds[s]) },
      });
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }

  strapi.log.info(`[bootstrap:seed] Created ${products.length} Sprint 3 software products`);
}
