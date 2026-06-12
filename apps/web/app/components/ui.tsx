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
  white: "bg-white",
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
    <section id={id} className={cx(SECTION_TONE[tone], "py-16 sm:py-20", className)}>
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
    <header className={cx("mb-10 max-w-3xl", align === "center" ? "mx-auto text-center" : "text-start")}>
      {eyebrow && (
        <p className={cx("mb-2 text-sm font-semibold tracking-wide", dark ? "text-accent-300" : "text-accent-600")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cx("text-3xl font-bold sm:text-4xl", dark ? "text-white" : "text-primary-900")}>{title}</h2>
      {description && (
        <p className={cx("mt-3 text-base leading-relaxed", dark ? "text-primary-100/80" : "text-slate-500")}>
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
  primary:   "bg-primary-700 text-white hover:bg-primary-800 shadow-sm",
  outline:   "border border-primary-200 text-primary-700 hover:border-primary-400 hover:bg-primary-50 bg-white",
  ghostDark: "border border-white/30 text-white hover:bg-white/10",
  white:     "bg-white text-primary-800 hover:bg-primary-50 shadow-sm",
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
  "rounded-2xl border border-slate-200/80 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(CARD, className)}>{children}</div>;
}

/* ── Stats ──────────────────────────────────────────────────── */

export function StatTile({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="text-center">
      <p className={cx("text-3xl font-bold sm:text-4xl", dark ? "text-white" : "text-primary-800")}>
        <span className={dark ? "text-accent-400" : "text-accent-600"}>{value}</span>
      </p>
      <p className={cx("mt-1 text-sm", dark ? "text-primary-100/75" : "text-slate-500")}>{label}</p>
    </div>
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
    <section className="bg-hero py-14 text-white sm:py-16">
      <Container>
        {titleEn && <p className="mb-2 text-sm font-semibold tracking-widest text-accent-300">{titleEn}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-primary-100/80">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}

/* ── Misc ───────────────────────────────────────────────────── */

export function EmptyState({ message }: { message: string }) {
  return <p className="py-16 text-center text-slate-400">{message}</p>;
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
