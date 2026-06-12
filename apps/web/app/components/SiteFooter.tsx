import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoWordmark } from "~/components/Logo";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: "الأنظمة",
    links: [
      { label: "نظام إدارة التأمين",        to: "/software/insurance-management-system" },
      { label: "نظام الإدارة الطبية",        to: "/software/medical-management-system" },
      { label: "نظام تخطيط موارد المؤسسات", to: "/software/erp-system" },
      { label: "جميع الأنظمة",              to: "/software" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "من نحن",       to: "/about" },
      { label: "خدماتنا",      to: "/services" },
      { label: "القطاعات",     to: "/industries" },
      { label: "عملاؤنا",      to: "/clients" },
      { label: "شركاؤنا",      to: "/partners" },
    ],
  },
  {
    title: "الموارد",
    links: [
      { label: "مركز الدعم",      to: "/support" },
      { label: "مركز التحميلات",  to: "/downloads" },
      { label: "الأسئلة الشائعة", to: "/faq" },
      { label: "قصص النجاح",      to: "/success-stories" },
      { label: "آراء العملاء",    to: "/testimonials" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-heroink-100">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand + contact */}
        <div className="lg:col-span-2">
          <LogoWordmark dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-heroink-200/80">
            شركة ليبية متخصصة في تطوير الأنظمة البرمجية للمؤسسات — نصنع البرمجيات، نبني المستقبل.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-heroink-200/90">
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="text-royal-400" /> طرابلس، ليبيا
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-royal-400" />
              <span dir="ltr">+218 91 000 0000</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-royal-400" /> info@alphabeta.ly
            </li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-sm font-bold tracking-wide text-white">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link to={l.to} className="text-sm text-heroink-200/80 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-heroink-300/70 sm:px-8">
          <p>© {new Date().getFullYear()} ألفا بيتا — جميع الحقوق محفوظة</p>
          <p className="flex gap-4">
            <Link to="/contact" className="hover:text-white">تواصل معنا</Link>
            <Link to="/request-quote" className="hover:text-white">اطلب عرض سعر</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
