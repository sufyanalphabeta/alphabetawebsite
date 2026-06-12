import type { Core } from "@strapi/strapi";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { blocks, logoSvg, placeholderPdf, placeholderSvg, uploadAsset, uploadSvg } from "./seed";

/**
 * Phase 6 — replace demo content with real ALPHABETA business content.
 * Idempotent: skipped entirely once the Rakiza ERP product exists.
 */
export async function seedPhase6RealContent(strapi: Core.Strapi) {
  const productQ = strapi.db.query("api::software-product.software-product");
  if (await productQ.findOne({ where: { slug: "rakiza-erp-system" } })) return;

  const now = () => new Date().toISOString();
  const catQ      = strapi.db.query("api::product-category.product-category");
  const industryQ = strapi.db.query("api::industry.industry");
  const featureQ  = strapi.db.query("api::product-feature.product-feature");
  const moduleQ   = strapi.db.query("api::product-module.product-module");
  const faqQ      = strapi.db.query("api::product-faq.product-faq");
  const serviceQ  = strapi.db.query("api::service.service");
  const ptypeQ    = strapi.db.query("api::partner-type.partner-type");
  const partnerQ  = strapi.db.query("api::partner.partner");
  const clientQ   = strapi.db.query("api::client.client");
  const storyQ    = strapi.db.query("api::success-story.success-story");
  const dlItemQ   = strapi.db.query("api::download-item.download-item");
  const dlCatQ    = strapi.db.query("api::download-category.download-category");
  const articleQ  = strapi.db.query("api::support-article.support-article");
  const faqItemQ  = strapi.db.query("api::faq-item.faq-item");
  const profileQ  = strapi.db.query("api::company-profile.company-profile");

  const bySlug = async (q: typeof catQ, slug: string) =>
    (await q.findOne({ where: { slug } })) as { id: number } | null;

  /* ── Categories: update names + add missing ── */
  const catUpdates: Array<[string, { name_ar: string; name_en: string }]> = [
    ["hr",                { name_ar: "حلول الموارد البشرية", name_en: "HR Solutions" }],
    ["insurance-systems", { name_ar: "حلول التأمين",          name_en: "Insurance Solutions" }],
    ["medical-systems",   { name_ar: "الحلول الطبية",          name_en: "Medical Solutions" }],
    ["erp-systems",       { name_ar: "أنظمة تخطيط الموارد",   name_en: "ERP Systems" }],
  ];
  for (const [slug, data] of catUpdates) {
    const c = await bySlug(catQ, slug);
    if (c) await catQ.update({ where: { id: c.id }, data });
  }
  const newCats = [
    { name_ar: "حلول التجزئة",   name_en: "Retail Solutions",     slug: "retail-solutions",     sort_order: 8 },
    { name_ar: "حلول المطاعم",   name_en: "Restaurant Solutions", slug: "restaurant-solutions", sort_order: 9 },
    { name_ar: "حلول الأرشفة",   name_en: "Archiving Solutions",  slug: "archiving-solutions",  sort_order: 10 },
  ];
  for (const c of newCats) {
    if (!(await bySlug(catQ, c.slug))) await catQ.create({ data: c });
  }

  /* ── Industries: add missing ── */
  const newIndustries = [
    { name_ar: "المطاعم والمقاهي", name_en: "Restaurants",   slug: "restaurants",   sort_order: 8 },
    { name_ar: "التصنيع",           name_en: "Manufacturing", slug: "manufacturing", sort_order: 9 },
    { name_ar: "النقل والخدمات اللوجستية", name_en: "Logistics", slug: "logistics", sort_order: 10 },
  ];
  for (const ind of newIndustries) {
    if (!(await bySlug(industryQ, ind.slug))) {
      await industryQ.create({ data: { ...ind, publishedAt: now() } });
    }
  }

  const industryIds = async (slugs: string[]) => {
    const ids: number[] = [];
    for (const s of slugs) {
      const ind = await bySlug(industryQ, s);
      if (ind) ids.push(ind.id);
    }
    return ids;
  };

  /* ── Flagship + product line definitions ── */
  interface P6Feature { t: string; te: string; d: string; de?: string; icon: string; type: "feature" | "capability" | "advantage" }
  interface P6Module  { n: string; ne: string; d: string; core: boolean }
  interface P6Faq     { q: string; qe: string; a: string }
  interface P6Product {
    name_ar: string; name_en: string; slug: string;
    tagline_ar: string; tagline_en: string;
    short_ar: string; short_en: string;
    long_ar: string;
    featured: boolean; sort: number;
    cat: string; industries: string[];
    audiences: Array<{ title_ar: string; title_en: string }>;
    accent: string; initials: string;
    features: P6Feature[]; modules: P6Module[]; faqs: P6Faq[];
  }

  const PRODUCTS: P6Product[] = [
    /* 1 ── Rakiza ERP & Inventory ── */
    {
      name_ar: "نظام الركيزة للتجارة وإدارة المخازن", name_en: "Rakiza ERP & Inventory Management",
      slug: "rakiza-erp-system",
      tagline_ar: "النظام الأكثر انتشاراً في ليبيا — أكثر من 15,000 مستخدم يديرون تجارتهم بالركيزة",
      tagline_en: "Libya's most popular business system — trusted by 15,000+ users",
      short_ar: "نظام متكامل للمبيعات والمشتريات والمخازن والحسابات، مصمم للمتاجر والجملة والصيدليات والشركات متعددة الفروع",
      short_en: "Complete sales, purchasing, inventory, and accounting system for retail, wholesale, pharmacies, and multi-branch businesses",
      long_ar: "نظام الركيزة هو الحل الأكثر انتشاراً لإدارة الأعمال التجارية في ليبيا، بأكثر من 15,000 مستخدم. يجمع النظام نقاط البيع والمخازن والمشتريات والحسابات في منصة واحدة سهلة الاستخدام، مع دعم كامل للباركود وتعدد الفروع والعملات، وتقارير أرباح لحظية تمنحك رؤية كاملة لأداء تجارتك.",
      featured: true, sort: 1,
      cat: "retail-solutions",
      industries: ["retail", "logistics", "manufacturing"],
      audiences: [
        { title_ar: "متاجر التجزئة",            title_en: "Retail Stores" },
        { title_ar: "تجار الجملة",              title_en: "Wholesale Businesses" },
        { title_ar: "الأسواق والسوبرماركت",     title_en: "Supermarkets" },
        { title_ar: "الصيدليات",                title_en: "Pharmacies" },
        { title_ar: "محلات الإلكترونيات",       title_en: "Electronics Stores" },
        { title_ar: "الشركات متعددة الفروع",    title_en: "Multi-Branch Businesses" },
      ],
      accent: "#1a4377", initials: "رك",
      features: [
        { t: "نقاط بيع سريعة وسهلة", te: "Fast Point of Sale", d: "شاشة بيع مصممة للسرعة: باركود، آجل ونقدي، عروض وخصومات، وفواتير مرتجع بضغطة واحدة", de: "Barcode-first POS with credit/cash sales, promotions, and one-tap returns", icon: "shopping-cart", type: "feature" },
        { t: "إدارة مخازن متعددة", te: "Multi-Warehouse Inventory", d: "تتبع الكميات والتحويلات بين المخازن والفروع مع جرد دوري ومستمر وتنبيهات حد الطلب", de: "Track quantities and transfers across warehouses with cycle counts and reorder alerts", icon: "package", type: "feature" },
        { t: "حسابات متكاملة", te: "Integrated Accounting", d: "قيود تلقائية من كل عملية بيع وشراء، أرصدة عملاء وموردين، وسندات قبض وصرف", de: "Automatic journal entries from every transaction with customer/vendor balances", icon: "wallet", type: "feature" },
        { t: "تقارير أرباح لحظية", te: "Real-Time Profit Reports", d: "أرباحك اليومية والشهرية وحركة كل صنف أمامك لحظة بلحظة", icon: "bar-chart", type: "capability" },
        { t: "تعدد الفروع والمستخدمين", te: "Multi-Branch & Multi-User", d: "إدارة مركزية لكل الفروع مع صلاحيات دقيقة لكل مستخدم", icon: "git-branch", type: "capability" },
        { t: "+15,000 مستخدم يثقون به", te: "Trusted by 15,000+ Users", d: "خبرة مثبتة في السوق الليبي بمختلف أنواع الأنشطة التجارية", icon: "users", type: "advantage" },
      ],
      modules: [
        { n: "المبيعات ونقاط البيع", ne: "Sales & POS",     d: "فواتير البيع الآجل والنقدي وشاشات الكاشير", core: true },
        { n: "المخازن والأصناف",     ne: "Inventory",       d: "الأصناف والكميات والتحويلات والجرد",        core: true },
        { n: "المشتريات والموردون",  ne: "Purchasing",      d: "أوامر وفواتير الشراء وأرصدة الموردين",      core: true },
        { n: "الحسابات والسندات",    ne: "Accounting",      d: "القيود والسندات وكشوف الحسابات",            core: true },
        { n: "التقارير والتحليلات",  ne: "Reports",         d: "تقارير المبيعات والأرباح والمخزون",          core: false },
      ],
      faqs: [
        { q: "هل يناسب النظام المحلات الصغيرة أم الشركات الكبيرة؟", qe: "Is it for small shops or large companies?", a: "الاثنين معاً — يبدأ معك بنقطة بيع واحدة ويتوسع حتى عشرات الفروع والمخازن بنفس قاعدة البيانات." },
        { q: "هل يدعم النظام أجهزة الباركود والطابعات الحرارية؟", qe: "Does it support barcode scanners and thermal printers?", a: "نعم، يدعم جميع قارئات الباركود وطابعات الفواتير الحرارية وأدراج النقد الشائعة في السوق." },
        { q: "هل يعمل النظام بدون إنترنت؟", qe: "Does it work offline?", a: "نعم، يعمل محلياً داخل منشأتك دون الحاجة لاتصال دائم، مع إمكانية الربط بين الفروع عند توفر الاتصال." },
      ],
    },

    /* 2 ── TPA Medical Claims ── */
    {
      name_ar: "نظام TPA لإدارة النفقات الطبية", name_en: "TPA Medical Claims Management",
      slug: "tpa-medical-claims-system",
      tagline_ar: "منصة المطالبات الطبية الأولى — من شبكة مزودي الخدمة حتى التسوية، بتحقق لحظي وضبط كامل للتكاليف",
      tagline_en: "Enterprise medical claims platform — provider network to settlement with real-time validation",
      short_ar: "منصة مؤسسية لإدارة النفقات الطبية: شبكة مزودي الخدمة، وثائق المنافع، معالجة فورية للمطالبات، موافقات طبية، وضبط للتكاليف",
      short_en: "Enterprise TPA platform: provider network, benefit policies, instant claims processing, medical approvals, and cost control",
      long_ar: "نظام TPA هو منصة ألفا بيتا الرائدة لإدارة النفقات الطبية، صُمم لشركات إدارة النفقات وشركات التأمين التي تدير شبكات طبية واسعة. يغطي النظام دورة المطالبة كاملة: من استقبالها لدى مزود الخدمة، مروراً بالتحقق اللحظي من التغطية والمنافع، والموافقات الطبية متعددة المستويات، وحتى التسوية المالية — مع رقابة كاملة على التكاليف ومؤشرات استهلاك فورية.",
      featured: true, sort: 2,
      cat: "insurance-systems",
      industries: ["insurance", "healthcare"],
      audiences: [
        { title_ar: "شركات إدارة النفقات الطبية (TPA)", title_en: "TPA Organizations" },
        { title_ar: "شركات التأمين",                     title_en: "Insurance Companies" },
        { title_ar: "إدارات المطالبات",                  title_en: "Claims Departments" },
        { title_ar: "شبكات مزودي الخدمة الطبية",         title_en: "Medical Provider Networks" },
      ],
      accent: "#0f3460", initials: "T",
      features: [
        { t: "شبكة مزودي الخدمة الطبية", te: "Medical Provider Network", d: "إدارة كاملة لشبكة المستشفيات والعيادات والصيدليات والمختبرات بعقودها وأسعارها التفضيلية", de: "Full management of hospitals, clinics, pharmacies, and labs with contracts and negotiated tariffs", icon: "network", type: "feature" },
        { t: "وثائق المنافع والتغطيات", te: "Benefit Policies", d: "بناء مرن لوثائق المنافع: الفئات، التغطيات، النسب، الاستثناءات، وحدود الاستهلاك", de: "Flexible benefit design: classes, coverages, co-pays, exclusions, and utilization limits", icon: "file-text", type: "feature" },
        { t: "معالجة مطالبات فورية", te: "Instant Claims Processing", d: "استقبال المطالبة ومعالجتها إلكترونياً لحظة تقديم الخدمة لدى المزود", de: "Claims received and adjudicated electronically at the point of service", icon: "zap", type: "feature" },
        { t: "الموافقات الطبية", te: "Medical Approvals", d: "سير عمل موافقات متعدد المستويات مع رأي طبي موثق لكل حالة", icon: "check-circle", type: "feature" },
        { t: "تحقق لحظي من التغطية", te: "Real-Time Validation", d: "التحقق من أهلية المستفيد وحدود تغطيته في أجزاء من الثانية", icon: "shield-check", type: "capability" },
        { t: "ضبط التكاليف", te: "Cost Control", d: "كشف الازدواجية والتجاوزات ومؤشرات استهلاك تحمي محفظتك الطبية", icon: "trending-down", type: "advantage" },
      ],
      modules: [
        { n: "الشبكة الطبية",        ne: "Provider Network", d: "المزودون والعقود والأسعار",                 core: true },
        { n: "المنافع والتغطيات",    ne: "Benefits",         d: "وثائق المنافع وفئات التغطية",               core: true },
        { n: "المطالبات",            ne: "Claims",           d: "استقبال ومعالجة وتسوية المطالبات",          core: true },
        { n: "الموافقات الطبية",     ne: "Approvals",        d: "سير عمل الموافقات والرأي الطبي",            core: true },
        { n: "الرقابة والتكاليف",    ne: "Cost Control",     d: "مؤشرات الاستهلاك وكشف التجاوزات",           core: false },
        { n: "التقارير التحليلية",   ne: "Analytics",        d: "تقارير الاستهلاك والمحفظة الطبية",           core: false },
      ],
      faqs: [
        { q: "كيف يتم ربط مزودي الخدمة بالنظام؟", qe: "How do providers connect to the system?", a: "عبر بوابة إلكترونية مخصصة للمزودين تتيح التحقق من الأهلية وتقديم المطالبات لحظياً، أو عبر واجهات برمجية API للأنظمة الكبيرة." },
        { q: "هل يدعم النظام التسعيرات التفضيلية لكل مزود؟", qe: "Does it support per-provider tariffs?", a: "نعم، لكل مزود قائمة أسعار تعاقدية خاصة تُطبق تلقائياً عند معالجة المطالبة." },
        { q: "كم تستغرق معالجة المطالبة؟", qe: "How long does claim adjudication take?", a: "المطالبات المطابقة للقواعد تُعالج آلياً في ثوانٍ، وما يحتاج رأياً طبياً يُحال فوراً لسير عمل الموافقات." },
      ],
    },

    /* 3 ── Alpha Care ── */
    {
      name_ar: "نظام ألفا كير لإدارة التأمين الطبي", name_en: "Alpha Care Insurance Medical Limits",
      slug: "alpha-care-insurance-system",
      tagline_ar: "إدارة السقوف المالية للتأمين الطبي بخصم لحظي — النظام المعتمد لدى شركة الواحة للتأمين",
      tagline_en: "Medical limits management with real-time deduction — trusted by Al Waha Insurance",
      short_ar: "نظام مؤسسي لإدارة السقوف المالية للتأمين الطبي: خصم لحظي، تحقق من التغطية، إدارة المستفيدين، وتكامل مع مزودي الخدمة",
      short_en: "Enterprise medical limits system: real-time deduction, coverage validation, beneficiary management, and provider integration",
      long_ar: "نظام ألفا كير يدير الجانب المالي الأدق في التأمين الطبي: السقوف والحدود. لكل مستفيد سقف مالي وتغطيات محددة، وعند كل خدمة طبية يتحقق النظام لحظياً من التغطية ويخصم من السقف مباشرة، فلا تجاوز ولا ازدواجية. يعمل النظام لدى شركة الواحة للتأمين — إحدى أعرق شركات التأمين الليبية — ويتكامل مباشرة مع شبكات مزودي الخدمة الطبية.",
      featured: true, sort: 3,
      cat: "insurance-systems",
      industries: ["insurance", "healthcare"],
      audiences: [
        { title_ar: "شركات التأمين",                 title_en: "Insurance Companies" },
        { title_ar: "شركات إدارة النفقات (TPA)",     title_en: "TPA Organizations" },
      ],
      accent: "#16697a", initials: "AC",
      features: [
        { t: "إدارة السقوف المالية", te: "Financial Limits Management", d: "سقوف سنوية وفرعية لكل مستفيد وفئة تغطية، بقواعد مرنة قابلة للتخصيص", de: "Annual and sub-limits per beneficiary and coverage class with flexible rules", icon: "gauge", type: "feature" },
        { t: "خصم لحظي من السقف", te: "Real-Time Deduction", d: "كل خدمة طبية تُخصم من سقف المستفيد لحظة تقديمها — رصيد التغطية دقيق دائماً", de: "Every medical service deducts from the limit the moment it is delivered", icon: "zap", type: "feature" },
        { t: "التحقق من التغطية", te: "Coverage Validation", d: "تحقق فوري من أهلية المستفيد ونوع التغطية والرصيد المتبقي قبل تقديم الخدمة", icon: "shield-check", type: "feature" },
        { t: "إدارة المستفيدين", te: "Beneficiary Management", d: "ملفات كاملة للمستفيدين وعائلاتهم وبطاقاتهم وتواريخ سريان تغطياتهم", icon: "users", type: "feature" },
        { t: "تكامل مع مزودي الخدمة", te: "Provider Integration", d: "ربط مباشر مع المستشفيات والعيادات والصيدليات للتحقق والخصم الفوري", icon: "link", type: "capability" },
        { t: "مرجعية مثبتة", te: "Proven Reference", d: "يعمل في بيئة إنتاج حقيقية لدى شركة الواحة للتأمين", icon: "award", type: "advantage" },
      ],
      modules: [
        { n: "السقوف والحدود",   ne: "Limits",        d: "السقوف السنوية والفرعية وقواعد الخصم",      core: true },
        { n: "المستفيدون",       ne: "Beneficiaries", d: "ملفات المستفيدين والبطاقات والتغطيات",       core: true },
        { n: "التحقق والخصم",    ne: "Validation",    d: "التحقق اللحظي والخصم الفوري",                core: true },
        { n: "تكامل المزودين",   ne: "Integration",   d: "بوابة وواجهات ربط مزودي الخدمة",             core: false },
        { n: "التقارير",          ne: "Reports",       d: "تقارير الاستهلاك والأرصدة",                  core: false },
      ],
      faqs: [
        { q: "ما الفرق بين ألفا كير ونظام TPA؟", qe: "How is Alpha Care different from the TPA system?", a: "ألفا كير متخصص في إدارة السقوف المالية والخصم اللحظي لشركات التأمين، بينما TPA يدير دورة المطالبات الكاملة. يتكامل النظامان معاً بسلاسة." },
        { q: "هل يمكن تخصيص قواعد السقوف لكل وثيقة؟", qe: "Can limit rules be customized per policy?", a: "نعم، السقوف والتغطيات والنسب تُعرّف على مستوى الوثيقة والفئة والمستفيد." },
        { q: "من يستخدم النظام حالياً؟", qe: "Who uses the system today?", a: "النظام معتمد في بيئة الإنتاج لدى شركة الواحة للتأمين لإدارة سقوف التأمين الطبي لمستفيديها." },
      ],
    },

    /* 4 ── Rakiza Restaurant ── */
    {
      name_ar: "نظام الركيزة لإدارة المطاعم والمقاهي", name_en: "Rakiza Restaurant & Café Management",
      slug: "rakiza-restaurant-system",
      tagline_ar: "من الطلب حتى المطبخ حتى الحساب — إدارة كاملة لمطعمك أو مقهاك",
      tagline_en: "Order to kitchen to bill — complete restaurant and café management",
      short_ar: "نقاط بيع سريعة، شاشات مطبخ، إدارة طاولات وتوصيل، ووصفات تضبط تكلفة كل طبق",
      short_en: "Fast POS, kitchen displays, table and delivery management, and recipe-level cost control",
      long_ar: "نظام الركيزة للمطاعم صُمم لإيقاع العمل السريع في المطاعم والمقاهي: شاشة كاشير تستوعب الضغط، طلبات تصل للمطبخ فوراً، إدارة للطاولات والتوصيل، ووصفات تحسب تكلفة كل طبق وتخصم مكوناته من المخزون تلقائياً — مع تقارير يومية تكشف أرباح كل صنف وفرع.",
      featured: false, sort: 4,
      cat: "restaurant-solutions",
      industries: ["restaurants", "retail"],
      audiences: [
        { title_ar: "المطاعم",                    title_en: "Restaurants" },
        { title_ar: "المقاهي",                    title_en: "Cafés" },
        { title_ar: "الوجبات السريعة",            title_en: "Fast Food Chains" },
        { title_ar: "سلاسل الأغذية متعددة الفروع", title_en: "Multi-Branch Food Businesses" },
      ],
      accent: "#b32a45", initials: "رم",
      features: [
        { t: "كاشير مصمم للسرعة", te: "Speed-First POS", d: "شاشة لمس بقوائم مصورة وتعديلات وإضافات، تستوعب ساعات الذروة", icon: "monitor", type: "feature" },
        { t: "شاشة المطبخ KDS", te: "Kitchen Display", d: "الطلبات تظهر في المطبخ لحظياً مصنفة بالأقسام مع زمن التحضير", icon: "chef-hat", type: "feature" },
        { t: "إدارة الطاولات", te: "Table Management", d: "خريطة صالة تفاعلية: حجز، دمج، تقسيم فواتير، وتحويل طلبات", icon: "layout-grid", type: "feature" },
        { t: "الوصفات والمكونات", te: "Recipes & Ingredients", d: "كل طبق بوصفته — يخصم مكوناته من المخزون ويحسب تكلفته الفعلية", icon: "list-checks", type: "capability" },
        { t: "التوصيل والطلبات الخارجية", te: "Delivery & Takeaway", d: "إدارة طلبات التوصيل والسفري مع تتبع السائقين", icon: "bike", type: "capability" },
        { t: "أرباح كل صنف أمامك", te: "Item-Level Profitability", d: "تعرف بالضبط أي الأصناف تربح وأيها يستنزفك", icon: "trending-up", type: "advantage" },
      ],
      modules: [
        { n: "نقاط البيع",        ne: "POS",       d: "الكاشير والطلبات والفواتير",       core: true },
        { n: "المطبخ",            ne: "Kitchen",   d: "شاشات العرض وتتبع التحضير",        core: true },
        { n: "المخزون والوصفات",  ne: "Inventory", d: "المكونات والوصفات والتكاليف",      core: true },
        { n: "التوصيل",           ne: "Delivery",  d: "الطلبات الخارجية والسائقون",       core: false },
        { n: "التقارير",           ne: "Reports",   d: "المبيعات والأرباح بالصنف والفرع",  core: false },
      ],
      faqs: [
        { q: "هل يدعم النظام أكثر من فرع بقائمة موحدة؟", qe: "Does it support multiple branches with one menu?", a: "نعم، قائمة مركزية بأسعار قابلة للتخصيص لكل فرع، مع تقارير مجمعة ومنفصلة." },
        { q: "هل تُخصم المكونات تلقائياً عند البيع؟", qe: "Are ingredients auto-deducted on sale?", a: "نعم، كل طبق مرتبط بوصفته فتُخصم مكوناته من المخزون لحظة البيع." },
        { q: "هل يعمل وقت انقطاع الإنترنت؟", qe: "Does it work during internet outages?", a: "نعم، الكاشير يعمل محلياً بالكامل ويزامن البيانات عند عودة الاتصال." },
      ],
    },

    /* 5 ── Rakiza Projects & Contracting ── */
    {
      name_ar: "نظام الركيزة لإدارة المشاريع والمقاولات", name_en: "Rakiza Projects & Contracting Management",
      slug: "rakiza-projects-system",
      tagline_ar: "عقودك ومستخلصاتك وتكاليف مشاريعك تحت السيطرة — من الترسية حتى التسليم",
      tagline_en: "Contracts, progress billing, and project costs under control",
      short_ar: "إدارة العقود والمستخلصات وتكاليف المشاريع والمقاولين بالباطن والمعدات في منصة واحدة",
      short_en: "Contracts, progress claims, project costing, subcontractors, and equipment in one platform",
      long_ar: "نظام الركيزة للمقاولات يمنح شركات الإنشاءات والمكاتب الهندسية رؤية مالية كاملة لكل مشروع: العقد وبنوده، المستخلصات الجارية والمعتمدة، تكاليف المواد والعمالة والمعدات، وحسابات المقاولين بالباطن — فتعرف في أي لحظة أين يقف مشروعك ربحاً وإنجازاً.",
      featured: false, sort: 5,
      cat: "erp-systems",
      industries: ["construction", "government"],
      audiences: [
        { title_ar: "شركات الإنشاءات",   title_en: "Construction Companies" },
        { title_ar: "شركات المقاولات",   title_en: "Contracting Firms" },
        { title_ar: "المكاتب الهندسية",  title_en: "Engineering Offices" },
        { title_ar: "مديرو المشاريع",    title_en: "Project Managers" },
      ],
      accent: "#533483", initials: "رق",
      features: [
        { t: "إدارة العقود وبنودها", te: "Contracts & BOQ", d: "جداول كميات تفصيلية لكل عقد مع متابعة المنفذ والمتبقي لكل بند", icon: "file-text", type: "feature" },
        { t: "المستخلصات", te: "Progress Claims", d: "إعداد المستخلصات الجارية والختامية واعتمادها ومتابعة دفعاتها", icon: "receipt", type: "feature" },
        { t: "تكاليف المشروع", te: "Project Costing", d: "تجميع تكاليف المواد والعمالة والمعدات على مستوى المشروع والبند", icon: "calculator", type: "feature" },
        { t: "المقاولون بالباطن", te: "Subcontractors", d: "عقود الباطن ومستخلصاتهم وأرصدتهم ومحجوزات الضمان", icon: "users", type: "capability" },
        { t: "المعدات والمواد", te: "Equipment & Materials", d: "حركة المواد للمواقع وتشغيل المعدات وتكاليفها", icon: "truck", type: "capability" },
        { t: "ربحية كل مشروع واضحة", te: "Per-Project Profitability", d: "مقارنة لحظية بين الإيراد المستخلص والتكلفة الفعلية", icon: "trending-up", type: "advantage" },
      ],
      modules: [
        { n: "العقود",              ne: "Contracts",      d: "العقود وجداول الكميات",            core: true },
        { n: "المستخلصات",          ne: "Claims",         d: "المستخلصات الجارية والختامية",     core: true },
        { n: "التكاليف",             ne: "Costing",        d: "تكاليف المواد والعمالة والمعدات",  core: true },
        { n: "مقاولو الباطن",        ne: "Subcontractors", d: "عقود ومستخلصات الباطن",            core: false },
        { n: "المعدات",              ne: "Equipment",      d: "تشغيل المعدات وتكاليفها",          core: false },
      ],
      faqs: [
        { q: "هل يدعم النظام محجوزات الضمان والدفعات المقدمة؟", qe: "Does it handle retention and advance payments?", a: "نعم، تُحتسب المحجوزات والدفعات المقدمة واستهلاكها تلقائياً في كل مستخلص." },
        { q: "هل يمكن متابعة أكثر من مشروع في نفس الوقت؟", qe: "Can I track multiple projects simultaneously?", a: "نعم، لوحة موحدة تعرض موقف كل المشاريع المالية ونسب إنجازها." },
        { q: "هل يتكامل مع نظام الركيزة للتجارة؟", qe: "Does it integrate with Rakiza ERP?", a: "نعم، يتشاركان المخازن والحسابات فتنساب تكاليف المواد للمشاريع مباشرة." },
      ],
    },

    /* 6 ── Rakiza Electronic Archive ── */
    {
      name_ar: "نظام الركيزة للأرشفة الإلكترونية", name_en: "Rakiza Electronic Archive",
      slug: "rakiza-archive-system",
      tagline_ar: "وثائق مؤسستك مؤرشفة، مفهرسة، وقابلة للاسترجاع في ثوانٍ — ويعمل دون اتصال",
      tagline_en: "Your documents archived, indexed, and retrievable in seconds — fully offline capable",
      short_ar: "أرشفة إلكترونية كاملة بالمسح الضوئي والفهرسة الذكية والبحث النصي، تعمل دون إنترنت وتناسب الجهات الحكومية والمؤسسات",
      short_en: "Complete e-archiving with batch scanning, smart indexing, and full-text search — works fully offline",
      long_ar: "نظام الركيزة للأرشفة يحوّل أرشيفك الورقي إلى مكتبة إلكترونية منظمة: مسح ضوئي دفعي، فهرسة بحقول مخصصة لكل نوع وثيقة، بحث نصي كامل، وصلاحيات اطلاع دقيقة بسجل تدقيق كامل. يعمل النظام محلياً دون أي اتصال بالإنترنت — وهو ما يجعله الخيار الأول للجهات الحكومية والمؤسسات ذات السرية العالية.",
      featured: false, sort: 6,
      cat: "archiving-solutions",
      industries: ["government", "ngo", "healthcare"],
      audiences: [
        { title_ar: "الجهات الحكومية",        title_en: "Government Entities" },
        { title_ar: "المنظمات غير الربحية",   title_en: "NGOs" },
        { title_ar: "المؤسسات والشركات",      title_en: "Enterprises" },
        { title_ar: "المنشآت الطبية",          title_en: "Medical Organizations" },
      ],
      accent: "#1a4377", initials: "أر",
      features: [
        { t: "مسح ضوئي دفعي", te: "Batch Scanning", d: "أرشفة آلاف الوثائق دفعة واحدة مع فصل وترقيم تلقائي", icon: "scan", type: "feature" },
        { t: "فهرسة ذكية بحقول مخصصة", te: "Smart Custom Indexing", d: "لكل نوع وثيقة حقول فهرسة خاصة: التاريخ، الجهة، الرقم الإشاري وغيرها", icon: "tags", type: "feature" },
        { t: "بحث نصي كامل", te: "Full-Text Search", d: "ابحث داخل محتوى الوثائق نفسها لا في عناوينها فقط", icon: "search", type: "feature" },
        { t: "صلاحيات وسجل تدقيق", te: "Permissions & Audit Trail", d: "من اطّلع وماذا طبع ومتى — كل حركة موثقة", icon: "shield", type: "capability" },
        { t: "يعمل دون إنترنت", te: "Fully Offline", d: "يعمل محلياً بالكامل داخل شبكة مؤسستك دون أي اتصال خارجي", icon: "wifi-off", type: "advantage" },
        { t: "نسخ احتياطي مؤتمت", te: "Automated Backups", d: "جدولة نسخ احتياطية محلية وخارجية لحماية أرشيفك", icon: "database-backup", type: "capability" },
      ],
      modules: [
        { n: "الأرشيف",        ne: "Archive",  d: "تنظيم الوثائق بالملفات والتصنيفات", core: true },
        { n: "المسح والإدخال", ne: "Capture",  d: "المسح الدفعي والاستيراد",            core: true },
        { n: "البحث",           ne: "Search",   d: "البحث النصي والفهارس",               core: true },
        { n: "الصلاحيات",       ne: "Security", d: "المستخدمون والصلاحيات والتدقيق",     core: false },
        { n: "التقارير",         ne: "Reports",  d: "إحصاءات الأرشيف والحركة",            core: false },
      ],
      faqs: [
        { q: "هل يحتاج النظام اتصالاً بالإنترنت؟", qe: "Does it require internet?", a: "لا، يعمل بالكامل داخل شبكتك المحلية — وهذا متطلب أساسي للجهات ذات السرية العالية." },
        { q: "هل يدعم البحث داخل الوثائق الممسوحة؟", qe: "Can it search inside scanned documents?", a: "نعم، عبر التعرف الضوئي على الحروف (OCR) يصبح نص الوثيقة قابلاً للبحث." },
        { q: "كيف تُضبط صلاحيات الاطلاع؟", qe: "How are access permissions controlled?", a: "صلاحيات على مستوى التصنيف والملف والوثيقة، مع سجل تدقيق لكل عملية اطلاع أو طباعة." },
      ],
    },

    /* 7 ── Attendance & Workforce ── */
    {
      name_ar: "نظام إدارة الحضور والانصراف", name_en: "Attendance & Workforce Management",
      slug: "attendance-workforce-system",
      tagline_ar: "بصمة، ورديات، إجازات، ورواتب مترابطة — انضباط القوى العاملة بلا جداول يدوية",
      tagline_en: "Biometrics, shifts, leave, and payroll-ready attendance",
      short_ar: "ربط أجهزة البصمة، ورديات مرنة، إدارة الإجازات والأذونات، وتقارير التزام جاهزة للرواتب",
      short_en: "Biometric device integration, flexible shifts, leave management, and payroll-ready reports",
      long_ar: "نظام الحضور والانصراف يجمع بيانات أجهزة البصمة والوجه من كل المواقع ويحوّلها إلى سجلات التزام دقيقة: ورديات صباحية ومسائية ودوارة، احتساب تلقائي للتأخير والإضافي، إدارة للإجازات والأذونات بسير اعتماد، وتقارير شهرية جاهزة للربط المباشر مع الرواتب.",
      featured: false, sort: 7,
      cat: "hr",
      industries: ["manufacturing", "government", "ngo"],
      audiences: [
        { title_ar: "الشركات",                title_en: "Companies" },
        { title_ar: "المصانع",                title_en: "Factories" },
        { title_ar: "المنظمات غير الربحية",   title_en: "NGOs" },
        { title_ar: "الجهات الحكومية",        title_en: "Government Organizations" },
      ],
      accent: "#2a5694", initials: "حض",
      features: [
        { t: "ربط أجهزة البصمة والوجه", te: "Biometric Integration", d: "سحب تلقائي للحركات من أجهزة البصمة والتعرف على الوجه بمختلف الماركات", icon: "fingerprint", type: "feature" },
        { t: "ورديات مرنة ودوارة", te: "Flexible & Rotating Shifts", d: "صباحي، مسائي، ليلي، ودوّار — مع استثناءات فردية وجداول رمضان", icon: "clock", type: "feature" },
        { t: "الإجازات والأذونات", te: "Leave & Permissions", d: "أرصدة إجازات بأنواعها وسير اعتماد إلكتروني للطلبات", icon: "calendar-check", type: "feature" },
        { t: "احتساب التأخير والإضافي", te: "Lateness & Overtime", d: "قواعد احتساب قابلة للتخصيص تطبق تلقائياً على كل حركة", icon: "timer", type: "capability" },
        { t: "جاهز للرواتب", te: "Payroll-Ready", d: "ملخص شهري لكل موظف يصدّر مباشرة لنظام الرواتب", icon: "wallet", type: "advantage" },
        { t: "مواقع متعددة", te: "Multi-Site", d: "تجميع حركات كل الفروع والمواقع في قاعدة واحدة", icon: "map-pin", type: "capability" },
      ],
      modules: [
        { n: "الأجهزة والحركات", ne: "Devices",   d: "ربط الأجهزة وسحب الحركات",         core: true },
        { n: "الورديات",          ne: "Shifts",    d: "جداول الدوام والاستثناءات",        core: true },
        { n: "الإجازات",          ne: "Leave",     d: "الأرصدة والطلبات والاعتمادات",     core: true },
        { n: "التقارير",           ne: "Reports",   d: "الالتزام والتأخير والإضافي",       core: false },
        { n: "تكامل الرواتب",     ne: "Payroll",   d: "التصدير لأنظمة الرواتب",            core: false },
      ],
      faqs: [
        { q: "ما أنواع أجهزة البصمة المدعومة؟", qe: "Which biometric devices are supported?", a: "الأجهزة الشائعة في السوق بمختلف ماركاتها — بصمة إصبع، بطاقة، وتعرف على الوجه." },
        { q: "هل يدعم النظام الورديات الدوارة للمصانع؟", qe: "Does it support rotating factory shifts?", a: "نعم، أنماط ورديات دوارة بالكامل مع تبديل آلي للمجموعات." },
        { q: "كيف يرتبط بالرواتب؟", qe: "How does it connect to payroll?", a: "يصدر ملخصاً شهرياً معتمداً (تأخير، غياب، إضافي) يُستورد مباشرة في نظام الرواتب أو الركيزة." },
      ],
    },
  ];

  /* ── Create the products ── */
  const created: Record<string, number> = {};
  const tmpDir = await mkdtemp(path.join(tmpdir(), "ab-seed6-"));
  try {
    for (const p of PRODUCTS) {
      const cat = await bySlug(catQ, p.cat);
      const indIds = await industryIds(p.industries);
      const row = await productQ.create({
        data: {
          name_ar: p.name_ar, name_en: p.name_en, slug: p.slug,
          tagline_ar: p.tagline_ar, tagline_en: p.tagline_en,
          short_description_ar: p.short_ar, short_description_en: p.short_en,
          long_description_ar: blocks(p.long_ar),
          target_audiences: p.audiences,
          is_featured: p.featured, sort_order: p.sort,
          category: cat?.id ?? null,
          industries: indIds,
          publishedAt: now(),
        },
      }) as { id: number };
      created[p.slug] = row.id;

      let i = 1;
      for (const f of p.features) {
        await featureQ.create({ data: {
          title_ar: f.t, title_en: f.te, description_ar: f.d, description_en: f.de ?? null,
          icon_name: f.icon, feature_type: f.type, sort_order: i++, product: row.id,
        } });
      }
      i = 1;
      for (const m of p.modules) {
        await moduleQ.create({ data: {
          name_ar: m.n, name_en: m.ne, description_ar: m.d, is_core: m.core, sort_order: i++, product: row.id,
        } });
      }
      i = 1;
      for (const f of p.faqs) {
        await faqQ.create({ data: {
          question_ar: f.q, question_en: f.qe, answer_ar: f.a, sort_order: i++, product: row.id, publishedAt: now(),
        } });
      }

      // brand visuals
      try {
        await uploadSvg(strapi, tmpDir, `${p.slug}-logo.svg`, logoSvg(p.initials, p.accent), {
          refId: row.id, field: "logo",
        });
        for (let s = 1; s <= 3; s++) {
          await uploadSvg(strapi, tmpDir, `${p.slug}-screen-${s}.svg`,
            placeholderSvg(`${p.name_en} — Screen ${s}`, p.accent),
            { refId: row.id, field: "screenshots" });
        }
      } catch (err) {
        strapi.log.warn(`[seed:phase6] media for ${p.slug}: ${String(err)}`);
      }
    }

    /* related products: rakiza family + insurance pair */
    const rel: Record<string, string[]> = {
      "rakiza-erp-system":         ["rakiza-restaurant-system", "rakiza-projects-system", "attendance-workforce-system"],
      "rakiza-restaurant-system":  ["rakiza-erp-system", "attendance-workforce-system"],
      "rakiza-projects-system":    ["rakiza-erp-system", "rakiza-archive-system"],
      "rakiza-archive-system":     ["rakiza-erp-system", "rakiza-projects-system"],
      "attendance-workforce-system": ["rakiza-erp-system", "rakiza-restaurant-system"],
      "tpa-medical-claims-system": ["alpha-care-insurance-system"],
      "alpha-care-insurance-system": ["tpa-medical-claims-system"],
    };
    for (const [slug, list] of Object.entries(rel)) {
      await productQ.update({ where: { id: created[slug] }, data: { related_products: list.map((s) => created[s]) } });
    }

    /* ── Retire old demo products ── */
    const oldSlugs = [
      "hr-management-system", "accounting-finance-system", "ecommerce-platform",
      "insurance-management-system", "medical-management-system", "erp-system",
    ];
    for (const slug of oldSlugs) {
      const old = await bySlug(productQ, slug);
      if (old) await productQ.update({ where: { id: old.id }, data: { publishedAt: null, is_featured: false, sort_order: 90 } });
    }

    /* ── Re-link demo trust content to real products + mark demo ── */
    const relinkClient = async (slug: string, productSlug: string) => {
      const c = (await clientQ.findOne({ where: { slug } })) as { id: number; description_ar?: string } | null;
      if (!c) return;
      const desc = c.description_ar ?? "";
      await clientQ.update({ where: { id: c.id }, data: {
        software_products: [created[productSlug]],
        description_ar: desc.startsWith("[محتوى تجريبي]") ? desc : `[محتوى تجريبي] ${desc}`,
      } });
    };
    await relinkClient("libya-insurance-company", "alpha-care-insurance-system");
    await relinkClient("tripoli-specialist-hospital", "tpa-medical-claims-system");
    await relinkClient("al-amal-charity", "rakiza-erp-system");

    // Real reference client: Al Waha Insurance (explicitly cited reference)
    if (!(await clientQ.findOne({ where: { slug: "al-waha-insurance" } }))) {
      const insuranceInd = await bySlug(industryQ, "insurance");
      const alwaha = await clientQ.create({ data: {
        name_ar: "شركة الواحة للتأمين", name_en: "Al Waha Insurance Company",
        slug: "al-waha-insurance",
        country_ar: "ليبيا", country_en: "Libya",
        description_ar: "من أعرق شركات التأمين الليبية — تعتمد نظام ألفا كير لإدارة السقوف المالية للتأمين الطبي والخصم اللحظي عبر شبكة مزودي الخدمة.",
        description_en: "One of Libya's most established insurers, running Alpha Care for medical limits management and real-time deduction.",
        industry: insuranceInd?.id ?? null,
        software_products: [created["alpha-care-insurance-system"]],
        is_featured: true, sort_order: 0,
        publishedAt: now(),
      } }) as { id: number };
      await uploadSvg(strapi, tmpDir, "al-waha-logo.svg", logoSvg("وح", "#0b6e4f"), {
        ref: "api::client.client", refId: alwaha.id, field: "logo",
      });
    }

    const relinkStory = async (slug: string, productSlug: string) => {
      const s = await storyQ.findOne({ where: { slug } }) as { id: number } | null;
      if (s) await storyQ.update({ where: { id: s.id }, data: { software_product: created[productSlug] } });
    };
    await relinkStory("libya-insurance-claims-digitization", "alpha-care-insurance-system");
    await relinkStory("tripoli-hospital-unified-emr", "tpa-medical-claims-system");
    await relinkStory("al-amal-charity-erp-transparency", "rakiza-erp-system");

    /* FAQ items: relink demo product references */
    const faqRelink: Array<[string, string]> = [
      ["هل يمكن ترقية نظام إدارة التأمين دون توقف الخدمة؟", "tpa-medical-claims-system"],
      ["هل يدعم النظام الطبي أجهزة متعددة في العيادة الواحدة؟", "alpha-care-insurance-system"],
    ];
    for (const [q, productSlug] of faqRelink) {
      const item = await faqItemQ.findOne({ where: { question_ar: q } }) as { id: number } | null;
      if (item) await faqItemQ.update({ where: { id: item.id }, data: { software_product: created[productSlug] } });
    }

    /* Support articles: retitle + relink to real products */
    const articleUpdates: Array<[string, { title_ar: string; product: string }]> = [
      ["insurance-system-requirements",    { title_ar: "متطلبات تشغيل نظام TPA للنفقات الطبية",        product: "tpa-medical-claims-system" }],
      ["registering-new-insurance-claim",  { title_ar: "دليل تسجيل مطالبة طبية في نظام TPA",            product: "tpa-medical-claims-system" }],
      ["medical-system-initial-setup",     { title_ar: "خطوات التهيئة الأولى لنظام ألفا كير",            product: "alpha-care-insurance-system" }],
      ["booking-appointments-medical",     { title_ar: "إعداد الورديات في نظام الحضور والانصراف",        product: "attendance-workforce-system" }],
      ["fixing-slow-reports-erp",          { title_ar: "حل مشكلة بطء التقارير في نظام الركيزة",          product: "rakiza-erp-system" }],
    ];
    for (const [slug, u] of articleUpdates) {
      const a = await articleQ.findOne({ where: { slug } }) as { id: number } | null;
      if (a) await articleQ.update({ where: { id: a.id }, data: { title_ar: u.title_ar, software_product: created[u.product] } });
    }

    /* Downloads: retire old demo files, add real-product files */
    const oldDl = ["insurance-system-brochure", "insurance-user-manual", "medical-system-brochure", "medical-user-manual", "erp-system-presentation", "erp-import-templates"];
    for (const slug of oldDl) {
      const d = await dlItemQ.findOne({ where: { slug } }) as { id: number } | null;
      if (d) await dlItemQ.update({ where: { id: d.id }, data: { publishedAt: null } });
    }
    const brochuresCat = await bySlug(dlCatQ, "brochures");
    const manualsCat   = await bySlug(dlCatQ, "user-manuals");
    const newDl = [
      { title_ar: "بروشور نظام الركيزة للتجارة",        slug: "rakiza-erp-brochure",      cat: brochuresCat, product: "rakiza-erp-system",          file: "rakiza-erp-brochure.pdf",      label: "Rakiza ERP - Brochure",       version: "12.0", date: "2026-05-20" },
      { title_ar: "دليل مستخدم نظام الركيزة",            slug: "rakiza-erp-manual",        cat: manualsCat,   product: "rakiza-erp-system",          file: "rakiza-erp-manual.pdf",        label: "Rakiza ERP - User Manual",    version: "12.0", date: "2026-05-22" },
      { title_ar: "بروشور نظام TPA للنفقات الطبية",      slug: "tpa-brochure",             cat: brochuresCat, product: "tpa-medical-claims-system",  file: "tpa-brochure.pdf",             label: "TPA Claims - Brochure",       version: "4.2",  date: "2026-05-10" },
      { title_ar: "بروشور نظام ألفا كير",                slug: "alpha-care-brochure",      cat: brochuresCat, product: "alpha-care-insurance-system", file: "alpha-care-brochure.pdf",     label: "Alpha Care - Brochure",       version: "3.5",  date: "2026-05-12" },
      { title_ar: "بروشور نظام الركيزة للمطاعم",         slug: "rakiza-restaurant-brochure", cat: brochuresCat, product: "rakiza-restaurant-system", file: "rakiza-restaurant-brochure.pdf", label: "Rakiza Restaurant - Brochure", version: "7.1", date: "2026-04-28" },
    ];
    let dlOrder = 1;
    for (const d of newDl) {
      const row = await dlItemQ.create({ data: {
        title_ar: d.title_ar, slug: d.slug,
        category: d.cat?.id ?? null, software_product: created[d.product],
        language: "ar", version: d.version, release_date: d.date,
        sort_order: dlOrder++, publishedAt: now(),
      } }) as { id: number };
      await uploadAsset(strapi, tmpDir, d.file, placeholderPdf(d.label), "application/pdf", {
        ref: "api::download-item.download-item", refId: row.id, field: "file",
      });
    }

    /* ── Partners: real categories + Dahua, recategorize demo partners ── */
    const newTypes = [
      { name_ar: "شريك مراقبة وأمن",   name_en: "Surveillance Partner",   slug: "surveillance-partner",   sort_order: 5 },
      { name_ar: "شريك شبكات",         name_en: "Networking Partner",     slug: "networking-partner",     sort_order: 6 },
      { name_ar: "شريك بنية تحتية",    name_en: "Infrastructure Partner", slug: "infrastructure-partner", sort_order: 7 },
    ];
    for (const t of newTypes) {
      if (!(await bySlug(ptypeQ, t.slug))) await ptypeQ.create({ data: t });
    }
    const surv = await bySlug(ptypeQ, "surveillance-partner");
    const netw = await bySlug(ptypeQ, "networking-partner");
    const infra = await bySlug(ptypeQ, "infrastructure-partner");

    if (!(await partnerQ.findOne({ where: { slug: "dahua" } }))) {
      const dahua = await partnerQ.create({ data: {
        name_ar: "داهوا", name_en: "Dahua Technology", slug: "dahua",
        website: "https://www.dahuasecurity.com",
        description_ar: "شراكة في حلول المراقبة والأمن: كاميرات، أنظمة تسجيل، وتحليلات فيديو ذكية ننفذها ضمن مشاريع الأمن والمراقبة لعملائنا.",
        description_en: "Surveillance and security partnership: cameras, NVRs, and intelligent video analytics delivered in our security projects.",
        partner_type: surv?.id ?? null, is_featured: true, sort_order: 1,
        publishedAt: now(),
      } }) as { id: number };
      await uploadSvg(strapi, tmpDir, "dahua-logo.svg", logoSvg("DH", "#c2272d"), {
        ref: "api::partner.partner", refId: dahua.id, field: "logo",
      });
    }
    const partnerUpdates: Array<[string, { type: number | null; description_ar: string }]> = [
      ["cisco", { type: netw?.id ?? null,  description_ar: "شريك حلول الشبكات: تصميم وتنفيذ شبكات المؤسسات والربط بين الفروع وحلول الأمن السيبراني." }],
      ["dell",  { type: infra?.id ?? null, description_ar: "شريك البنية التحتية: خوادم ووحدات تخزين ومحطات عمل لمراكز بيانات عملائنا." }],
    ];
    for (const [slug, u] of partnerUpdates) {
      const p = await partnerQ.findOne({ where: { slug } }) as { id: number } | null;
      if (p) await partnerQ.update({ where: { id: p.id }, data: { partner_type: u.type, description_ar: u.description_ar } });
    }

    /* ── Services: add real business lines ── */
    const newServices = [
      { name_ar: "تخصيص الأنظمة",            name_en: "System Customization",               slug: "system-customization",      description_ar: "نطوّع أنظمتنا الجاهزة لتطابق دورة عملك بالضبط: حقول، تقارير، وسير عمل حسب الطلب", sort_order: 5 },
      { name_ar: "حلول المراقبة والأمن",      name_en: "Surveillance & Security Solutions",  slug: "surveillance-solutions",    description_ar: "تصميم وتركيب أنظمة كاميرات المراقبة والتحكم في الدخول بالشراكة مع كبرى العلامات العالمية", sort_order: 6 },
      { name_ar: "حلول البنية التحتية للشبكات", name_en: "Network Infrastructure Solutions", slug: "network-infrastructure",    description_ar: "تمديد وتجهيز شبكات المؤسسات: كابلات، أجهزة، ربط فروع، وغرف خوادم متكاملة", sort_order: 7 },
    ];
    for (const s of newServices) {
      if (!(await serviceQ.findOne({ where: { slug: s.slug } }))) {
        await serviceQ.create({ data: { ...s, is_featured: false, publishedAt: now() } });
      }
    }

    /* ── Company profile: real business areas ── */
    const profile = await profileQ.findOne({}) as { id: number } | null;
    if (profile) {
      await profileQ.update({ where: { id: profile.id }, data: {
        about_ar: [
          { type: "paragraph", children: [{ type: "text", text: "ألفا بيتا شركة ليبية متخصصة في تطوير الأنظمة البرمجية وحلول التقنية للمؤسسات، تعمل في ستة مجالات رئيسية:" }] },
          { type: "list", format: "unordered", children: [
            { type: "list-item", children: [{ type: "text", text: "حلول البرمجيات المؤسسية" }] },
            { type: "list-item", children: [{ type: "text", text: "حلول تقنية التأمين" }] },
            { type: "list-item", children: [{ type: "text", text: "حلول إدارة المطالبات والنفقات الطبية" }] },
            { type: "list-item", children: [{ type: "text", text: "أنظمة تخطيط الموارد وإدارة الأعمال (الركيزة)" }] },
            { type: "list-item", children: [{ type: "text", text: "حلول المراقبة والأمن" }] },
            { type: "list-item", children: [{ type: "text", text: "حلول البنية التحتية للشبكات" }] },
          ] },
        ],
      } });
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }

  strapi.log.info("[bootstrap:seed] Phase 6 — real ALPHABETA business content seeded");
}
