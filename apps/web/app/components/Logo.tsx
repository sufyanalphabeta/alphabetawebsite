import { useId } from "react";
import { cx } from "~/components/ui";

/**
 * ALPHABETA brand mark — faithful vector of the official logo:
 * a thick ring broken at the lower-right, an "A" whose legs merge into
 * the ring, an inner node leg exiting through the gap, and node dots
 * at the apex and the inner joint.
 *
 * `mono` renders the premium single-color treatment (currentColor) for
 * dark surfaces such as the footer.
 */
export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  const id = useId();
  const paint = mono ? "currentColor" : `url(#${id})`;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {!mono && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1e40af" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      )}
      <g fill="none" stroke={paint} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
        {/* ring — long arc, gap at the lower-right */}
        <path d="M 101.7 79.4 A 46 46 0 1 0 79.4 101.7" />
        {/* the A — left leg lands on the ring, right leg merges into the ring end */}
        <path d="M 22.3 86.4 L 56 26 L 101.7 79.4" />
        {/* inner node leg exiting through the gap */}
        <path d="M 60 62 L 90 97" />
      </g>
      <circle cx="56" cy="26" r="9.5" fill={paint} />
      <circle cx="60" cy="62" r="9.5" fill={paint} />
    </svg>
  );
}

export function LogoWordmark({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cx("flex items-center gap-3", className)}>
      <LogoMark mono={dark} className={cx("h-11 w-11 shrink-0", dark && "text-white")} />
      <span className="flex flex-col justify-center leading-none">
        <span
          dir="ltr"
          className={cx(
            "text-[1.15rem] font-extrabold tracking-[0.08em]",
            dark
              ? "text-white"
              : "bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:via-sky-400 dark:to-blue-400",
          )}
        >
          ALPHA&nbsp;BETA
        </span>
        <span className={cx("mt-1 text-[0.68rem] font-semibold tracking-wide", dark ? "text-heroink-200/70" : "text-slate-400")}>
          ألفا بيتا للبرمجيات
        </span>
      </span>
    </span>
  );
}
