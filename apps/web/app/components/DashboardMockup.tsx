import {
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  FileCheck,
  HeartPulse,
  Search,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type Icon = typeof FileCheck;

export interface MockupConfig {
  /** Short app name shown in the fake top bar */
  appName: string;
  nav: string[];
  kpis: Array<{ icon: Icon; label: string; value: string; delta: string }>;
  chartTitle: string;
  chartBadge: string;
  bars: number[];
  rows: Array<{ label: string; width: number }>;
}

const GENERIC: MockupConfig = {
  appName: "αβ",
  nav: ["لوحة التحكم", "العمليات", "السجلات", "التقارير", "الإعدادات"],
  kpis: [
    { icon: FileCheck,  label: "معاملات اليوم", value: "164",   delta: "+12%" },
    { icon: Users,      label: "سجلات نشطة",    value: "8,420", delta: "+3%" },
    { icon: TrendingUp, label: "نسبة الإنجاز",   value: "97%",   delta: "+1.4%" },
  ],
  chartTitle: "النشاط الأسبوعي",
  chartBadge: "آخر 7 أيام",
  bars: [42, 68, 54, 80, 62, 92, 74],
  rows: [
    { label: "", width: 88 },
    { label: "", width: 72 },
    { label: "", width: 60 },
  ],
};

/** System-specific back-office illustrations, keyed by product slug. */
export const SYSTEM_MOCKUPS: Record<string, MockupConfig> = {
  "insurance-management-system": {
    appName: "تأمين",
    nav: ["لوحة التحكم", "المطالبات", "الوثائق", "مزودو الخدمة", "التقارير"],
    kpis: [
      { icon: FileCheck,  label: "مطالبات اليوم", value: "164",   delta: "+12%" },
      { icon: Users,      label: "وثائق نشطة",    value: "8,420", delta: "+3%" },
      { icon: HeartPulse, label: "مزودو الخدمة",  value: "312",   delta: "+5" },
    ],
    chartTitle: "المطالبات الأسبوعية",
    chartBadge: "آخر 7 أيام",
    bars: [42, 68, 54, 80, 62, 92, 74],
    rows: [
      { label: "مطالبة #8841 — قيد الموافقة", width: 88 },
      { label: "مطالبة #8839 — تمت التسوية", width: 72 },
      { label: "وثيقة جديدة — مركبات",        width: 60 },
    ],
  },
  "medical-management-system": {
    appName: "طبي",
    nav: ["لوحة التحكم", "المواعيد", "المرضى", "العيادات", "الفوترة"],
    kpis: [
      { icon: CalendarDays, label: "مواعيد اليوم", value: "248",    delta: "+9%" },
      { icon: Users,        label: "ملفات المرضى", value: "30,114", delta: "+126" },
      { icon: Stethoscope,  label: "عيادات نشطة",  value: "18",     delta: "+2" },
    ],
    chartTitle: "الحجوزات الأسبوعية",
    chartBadge: "آخر 7 أيام",
    bars: [55, 70, 48, 84, 66, 90, 78],
    rows: [
      { label: "حجز جديد — عيادة القلب",    width: 86 },
      { label: "نتيجة مختبر — جاهزة",        width: 70 },
      { label: "وصفة صرفت — صيدلية المجمع", width: 58 },
    ],
  },
  "erp-system": {
    appName: "ERP",
    nav: ["لوحة التحكم", "المالية", "المخزون", "الموارد البشرية", "المشتريات"],
    kpis: [
      { icon: Wallet, label: "إيرادات الشهر", value: "1.2M",  delta: "+8%" },
      { icon: Boxes,  label: "أصناف المخزون", value: "5,730", delta: "+1.1%" },
      { icon: Users,  label: "موظفون",         value: "412",   delta: "+6" },
    ],
    chartTitle: "التدفق المالي",
    chartBadge: "آخر 7 أيام",
    bars: [60, 45, 75, 58, 88, 70, 95],
    rows: [
      { label: "قيد يومية — مبيعات فرع طرابلس",  width: 90 },
      { label: "أمر شراء #PO-3321 — معتمد",       width: 74 },
      { label: "تسوية مخزنية — المستودع الرئيسي", width: 62 },
    ],
  },
};

export function mockupFor(slug?: string): MockupConfig {
  return (slug && SYSTEM_MOCKUPS[slug]) || GENERIC;
}

/**
 * Pure-CSS dashboard illustration used in hero sections — no images,
 * no chart libraries. Pass a config to theme it per system.
 */
export function DashboardMockup({
  config = SYSTEM_MOCKUPS["insurance-management-system"],
}: {
  config?: MockupConfig;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card text-start shadow-2xl ring-1 ring-white/20">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-card px-4 py-2.5">
        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary-solid px-1.5 text-[0.6rem] font-bold text-white">
          {config.appName}
        </span>
        <span className="hidden items-center gap-1.5 rounded-lg bg-surface px-3 py-1 text-[0.65rem] text-slate-400 sm:flex">
          <Search size={11} /> بحث سريع…
        </span>
        <span className="ms-auto relative">
          <Bell size={14} className="text-slate-300" />
          <span className="absolute -top-1 -start-1 h-2 w-2 rounded-full bg-accent-500" />
        </span>
        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-sky-300" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-36 shrink-0 space-y-1 border-e border-slate-100 bg-surface/60 p-3 sm:block">
          {config.nav.map((item, i) => (
            <div
              key={item}
              className={
                i === 0
                  ? "rounded-lg bg-primary-solid px-3 py-1.5 text-[0.65rem] font-semibold text-white"
                  : "rounded-lg px-3 py-1.5 text-[0.65rem] text-slate-400"
              }
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 p-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2.5">
            {config.kpis.map(({ icon: Icon, label, value, delta }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-card p-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <Icon size={13} className="text-royal-500" />
                  <span className="text-[0.55rem] font-bold text-emerald-600">{delta}</span>
                </div>
                <p className="mt-1.5 text-sm font-extrabold text-primary-900">{value}</p>
                <p className="text-[0.55rem] text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart card */}
          <div className="rounded-xl border border-slate-100 bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[0.65rem] font-bold text-primary-900">
                <BarChart3 size={12} className="text-royal-500" /> {config.chartTitle}
              </p>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[0.55rem] font-semibold text-primary-700">
                {config.chartBadge}
              </span>
            </div>
            <div className="mt-3 flex h-20 items-end gap-2">
              {config.bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-royal-600 to-royal-400"
                  style={{ height: `${h}%`, opacity: 0.6 + (i / config.bars.length) * 0.4 }}
                />
              ))}
            </div>
          </div>

          {/* Activity rows */}
          <div className="space-y-1.5 rounded-xl border border-slate-100 bg-card p-3 shadow-sm">
            {config.rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-royal-500" />
                {r.label ? (
                  <span className="truncate text-[0.6rem] text-slate-500">{r.label}</span>
                ) : (
                  <span className="h-1.5 rounded-full bg-slate-100" style={{ width: `${r.width}%` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
