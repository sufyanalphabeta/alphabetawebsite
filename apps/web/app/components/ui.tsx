import { useEffect, useRef, useState } from "react";
import type { ReactNode, ComponentProps } from "react";
import { Link } from "@tanstack/react-router";

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ── Layout ─────────────────────────────────────────────────── */

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

export type SectionTone = "white" | "muted" | "dark";

const SECTION_TONE: Record<SectionTone, string> = {
  white: "bg-card",
  muted: "bg-surface",
  dark:  "bg-hero text-white",
};

export function Section({
  tone = "white",
  className,
  id,
  children,
}: {
  tone?: SectionTone;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx(SECTION_TONE[tone], "py-20 sm:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  dark?: boolean;
}) {
  return (
    <header className={cx("mb-12 max-w-3xl", align === "center" ? "mx-auto text-center" : "text-start")}>
      {eyebrow && (
        <p className={cx(
          "mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-wide",
          dark ? "text-royal-400" : "text-royal-500"
        )}>
          <span className={cx("inline-block h-1 w-5 rounded-full", dark ? "bg-royal-400" : "bg-royal-500")} />
          {eyebrow}
        </p>
      )}
      <h2 className={cx("text-3xl font-extrabold tracking-tight sm:text-4xl", dark ? "text-white" : "text-primary-900")}>{title}</h2>
      {description && (
        <p className={cx("mt-3 text-base leading-relaxed", dark ? "text-heroink-100/80" : "text-slate-500")}>
          {description}
        </p>
      )}
    </header>
  );
}

/* ── Buttons ────────────────────────────────────────────────── */

export type ButtonVariant = "accent" | "primary" | "outline" | "ghostDark" | "white";
export type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 whitespace-nowrap";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  accent:    "bg-accent-500 text-white hover:bg-accent-600 shadow-sm",
  primary:   "bg-primary-solid text-white hover:bg-primary-solid-hover shadow-sm",
  outline:   "border border-primary-200 text-primary-700 hover:border-primary-400 hover:bg-primary-50 bg-card",
  ghostDark: "border border-white/30 text-white hover:bg-white/10",
  white:     "bg-card text-primary-800 hover:bg-primary-50 shadow-sm",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-[0.95rem]",
  lg: "px-8 py-3.5 text-base",
};

export function buttonClass(variant: ButtonVariant = "accent", size: ButtonSize = "md", className?: string) {
  return cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className);
}

export function Button({
  variant = "accent",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}

export function LinkButton({
  variant = "accent",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...props} className={buttonClass(variant, size, className)} />;
}

/* ── Badges & cards ─────────────────────────────────────────── */

export type BadgeTone = "primary" | "accent" | "neutral" | "darkGlass";

const BADGE_TONE: Record<BadgeTone, string> = {
  primary:   "bg-primary-50 text-primary-700",
  accent:    "bg-accent-50 text-accent-700",
  neutral:   "bg-surface-2 text-slate-600",
  darkGlass: "bg-white/15 text-white",
};

export function Badge({
  tone = "primary",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", BADGE_TONE[tone], className)}>
      {children}
    </span>
  );
}

export const CARD =
  "rounded-2xl border border-slate-200/80 bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(CARD, className)}>{children}</div>;
}

/* ── Motion primitives (IntersectionObserver, no deps) ──────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** Fades+slides children in when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={inView && delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cx(inView ? "animate-fade-up" : "opacity-0", className)}
    >
      {children}
    </div>
  );
}

/** Animated counter that runs once when visible. */
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1400,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView(0.4);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(end * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}{value}{suffix}
    </span>
  );
}

/** Infinite horizontal logo marquee (CSS-only animation). */
export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div dir="ltr" className={cx("mask-fade-x overflow-hidden", className)}>
      <div className="flex w-max items-center gap-14 animate-marquee">
        {children}
        {children}
      </div>
    </div>
  );
}

/** Browser-chrome frame for screenshots / mockups. */
export function BrowserFrame({
  url = "app.alphabeta.ly",
  className,
  children,
}: {
  url?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-card-hover", className)}>
      <div dir="ltr" className="flex items-center gap-2 border-b border-slate-100 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="mx-auto flex items-center rounded-md bg-card px-4 py-0.5 text-[0.65rem] text-slate-400 ring-1 ring-slate-200">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── Stats ──────────────────────────────────────────────────── */

export function StatTile({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="text-center">
      <p className={cx("text-3xl font-bold sm:text-4xl", dark ? "text-white" : "text-primary-800")}>
        <span className={dark ? "text-royal-400" : "text-royal-500"}>{value}</span>
      </p>
      <p className={cx("mt-1 text-sm", dark ? "text-heroink-100/75" : "text-slate-500")}>{label}</p>
    </div>
  );
}

/* ── Brand watermark (mono mark for hero corners) ───────────── */

export function BrandWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={cx("pointer-events-none absolute text-white", className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 101.7 79.4 A 46 46 0 1 0 79.4 101.7" />
        <path d="M 22.3 86.4 L 56 26 L 101.7 79.4" />
        <path d="M 60 62 L 90 97" />
      </g>
      <circle cx="56" cy="26" r="9.5" fill="currentColor" />
      <circle cx="60" cy="62" r="9.5" fill="currentColor" />
    </svg>
  );
}

/* ── Page hero (inner pages) ────────────────────────────────── */

export function PageHero({
  title,
  titleEn,
  subtitle,
  children,
}: {
  title: string;
  titleEn?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-mesh relative overflow-hidden py-18 text-white sm:py-24">
      <div className="bg-grid-dark pointer-events-none absolute inset-0" />
      <BrandWatermark className="-end-16 -bottom-28 h-96 w-96 opacity-[0.07]" />
      <Container className="relative animate-fade-up">
        {titleEn && (
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-royal-400">
            <span className="inline-block h-0.5 w-5 rounded-full bg-royal-400" />
            {titleEn}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.12]">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-heroink-100/80">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}

/* ── Misc ───────────────────────────────────────────────────── */

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </span>
      <p className="text-base text-slate-400">{message}</p>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <span aria-label={`التقييم ${r} من 5`} className="tracking-widest text-amber-400">
      {"★".repeat(r)}
      <span className="text-slate-200">{"★".repeat(5 - r)}</span>
    </span>
  );
}
