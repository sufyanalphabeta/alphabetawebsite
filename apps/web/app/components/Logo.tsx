import { cx } from "~/components/ui";

/**
 * ALPHABETA brand mark — ring + A-peak with node dots (vector recreation
 * of the official logo).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ab-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e40af" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#ab-mark)" strokeWidth="9" strokeLinecap="round">
        {/* ring, broken where the inner leg exits */}
        <path d="M67 88 A 42 42 0 1 1 79 76" />
        {/* the A */}
        <path d="M22 80 L50 26 L78 80" />
        {/* inner leg */}
        <path d="M56 60 L70 86" />
      </g>
      <circle cx="50" cy="26" r="8" fill="url(#ab-mark)" />
      <circle cx="56" cy="60" r="8" fill="url(#ab-mark)" />
    </svg>
  );
}

export function LogoWordmark({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cx("flex items-center gap-2.5", className)}>
      <LogoMark className="h-10 w-10" />
      <span className="flex flex-col leading-none">
        <span
          dir="ltr"
          className={cx(
            "bg-gradient-to-l from-sky-400 to-blue-700 bg-clip-text text-[1.05rem] font-extrabold tracking-wide text-transparent",
            dark && "from-sky-300 to-blue-400",
          )}
        >
          ALPHA BETA
        </span>
        <span className={cx("mt-0.5 text-[0.7rem] font-semibold", dark ? "text-primary-200/70" : "text-slate-400")}>
          ألفا بيتا للبرمجيات
        </span>
      </span>
    </span>
  );
}
