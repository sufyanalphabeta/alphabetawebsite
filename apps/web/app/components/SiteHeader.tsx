import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { cx, LinkButton } from "~/components/ui";
import { LogoWordmark } from "~/components/Logo";
import { ThemeToggle } from "~/components/ThemeToggle";

interface NavLeaf {
  label: string;
  to: string;
}
interface NavGroup {
  label: string;
  items: NavLeaf[];
}
type NavEntry = NavLeaf | NavGroup;

const NAV: NavEntry[] = [
  {
    label: "المنتجات",
    items: [
      { label: "نظام إدارة التأمين",        to: "/software/insurance-management-system" },
      { label: "نظام الإدارة الطبية",        to: "/software/medical-management-system" },
      { label: "نظام تخطيط موارد المؤسسات", to: "/software/erp-system" },
      { label: "جميع الأنظمة ←",            to: "/software" },
    ],
  },
  { label: "الخدمات",  to: "/services" },
  { label: "القطاعات", to: "/industries" },
  {
    label: "الشركة",
    items: [
      { label: "من نحن",       to: "/about" },
      { label: "عملاؤنا",      to: "/clients" },
      { label: "شركاؤنا",      to: "/partners" },
      { label: "قصص النجاح",   to: "/success-stories" },
      { label: "آراء العملاء", to: "/testimonials" },
    ],
  },
  {
    label: "الموارد",
    items: [
      { label: "مركز الدعم",      to: "/support" },
      { label: "مركز التحميلات",  to: "/downloads" },
      { label: "الأسئلة الشائعة", to: "/faq" },
    ],
  },
];

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

function DesktopDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "flex items-center gap-1 rounded-md px-3 py-2 text-[0.95rem] font-medium transition-colors",
          open ? "text-primary-700" : "text-slate-600 hover:text-primary-700",
        )}
        aria-expanded={open}
      >
        {group.label}
        <ChevronDown size={15} className={cx("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 w-64 pt-2">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-card py-2 shadow-card-hover">
            {group.items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b bg-card/95 backdrop-blur transition-shadow",
        scrolled ? "border-slate-200 shadow-sm" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-5 sm:px-8">
        {/* Logo */}
        <Link to="/" aria-label="ألفا بيتا — الرئيسية">
          <LogoWordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="ms-6 hidden items-center gap-1 lg:flex">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <DesktopDropdown key={entry.label} group={entry} />
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                className="rounded-md px-3 py-2 text-[0.95rem] font-medium text-slate-600 transition-colors hover:text-primary-700"
                activeProps={{ className: "rounded-md px-3 py-2 text-[0.95rem] font-semibold text-primary-700" }}
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ms-auto hidden items-center gap-3 lg:flex">
          <Link to="/contact" className="text-[0.95rem] font-medium text-slate-600 transition-colors hover:text-primary-700">
            تواصل معنا
          </Link>
          <ThemeToggle />
          <LinkButton to="/request-demo" variant="primary" size="sm">
            اطلب عرضاً توضيحياً
          </LinkButton>
        </div>

        {/* Mobile controls */}
        <div className="ms-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-primary-800"
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-card px-5 pb-6 pt-2 shadow-card lg:hidden">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <details key={entry.label} className="border-b border-slate-100">
                <summary className="flex cursor-pointer items-center justify-between py-3.5 text-base font-semibold text-slate-700">
                  {entry.label}
                  <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform [[open]_&]:rotate-180" />
                </summary>
                <div className="pb-3 ps-3">
                  {entry.items.map((item) => (
                    <Link key={item.to + item.label} to={item.to} className="block py-2.5 text-sm font-medium text-slate-500 hover:text-primary-700">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                className="block border-b border-slate-100 py-3.5 text-base font-semibold text-slate-700 hover:text-primary-700"
              >
                {entry.label}
              </Link>
            ),
          )}
          <Link to="/contact" className="block border-b border-slate-100 py-3.5 text-base font-semibold text-slate-700 hover:text-primary-700">
            تواصل معنا
          </Link>
          <LinkButton to="/request-demo" variant="primary" size="md" className="mt-4 w-full">
            اطلب عرضاً توضيحياً
          </LinkButton>
        </nav>
      )}
    </header>
  );
}
