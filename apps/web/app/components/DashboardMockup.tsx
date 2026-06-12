import { BarChart3, Bell, FileCheck, Search, TrendingUp, Users } from "lucide-react";

/**
 * Pure-CSS dashboard illustration used in hero sections — no images,
 * no chart libraries. Represents an AlphaBeta system back-office.
 */
export function DashboardMockup() {
  const bars = [42, 68, 54, 80, 62, 92, 74];
  return (
    <div className="overflow-hidden rounded-2xl bg-white text-start shadow-2xl ring-1 ring-white/20">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-700 text-[0.6rem] font-bold text-white">αβ</span>
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
          {["لوحة التحكم", "المطالبات", "الوثائق", "التقارير", "الإعدادات"].map((item, i) => (
            <div
              key={item}
              className={
                i === 0
                  ? "rounded-lg bg-primary-700 px-3 py-1.5 text-[0.65rem] font-semibold text-white"
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
            {[
              { icon: FileCheck,  label: "مطالبات اليوم", value: "164",   delta: "+12%" },
              { icon: Users,      label: "وثائق نشطة",    value: "8,420", delta: "+3%" },
              { icon: TrendingUp, label: "نسبة الإنجاز",   value: "97%",   delta: "+1.4%" },
            ].map(({ icon: Icon, label, value, delta }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <Icon size={13} className="text-primary-500" />
                  <span className="text-[0.55rem] font-bold text-emerald-500">{delta}</span>
                </div>
                <p className="mt-1.5 text-sm font-extrabold text-primary-900">{value}</p>
                <p className="text-[0.55rem] text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart card */}
          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[0.65rem] font-bold text-primary-900">
                <BarChart3 size={12} className="text-accent-500" /> المطالبات الأسبوعية
              </p>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[0.55rem] font-semibold text-primary-700">آخر 7 أيام</span>
            </div>
            <div className="mt-3 flex h-20 items-end gap-2">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary-700 to-sky-400" style={{ height: `${h}%`, opacity: 0.65 + (i / bars.length) * 0.35 }} />
              ))}
            </div>
          </div>

          {/* Table skeleton */}
          <div className="space-y-1.5 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            {[88, 72, 60].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                <span className="h-1.5 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
