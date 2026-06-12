import { useState } from "react";
import { cx } from "~/components/ui";
import { LogoMark } from "~/components/Logo";
import type { ProductModule } from "~/lib/types";

/**
 * Interactive enterprise architecture diagram: the system as a hub with
 * its modules as connected nodes on a circle. Pure CSS/SVG — desktop only
 * (callers should keep the card grid as the small-screen fallback).
 */
export function ModulesDiagram({
  systemName,
  modules,
}: {
  systemName: string;
  modules: ProductModule[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const items = modules.slice(0, 8);
  const n = items.length;
  if (n < 3) return null;

  // Node positions on a circle (percent coordinates, center 50/50)
  const radius = 38;
  const pos = items.map((_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-2xl select-none">
      {/* connection lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {pos.map((p, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={p.x}
            y2={p.y}
            strokeWidth={active === i ? 0.7 : 0.35}
            className={cx(
              "transition-all duration-200",
              active === i ? "stroke-royal-500" : "stroke-slate-300",
            )}
            strokeDasharray={active === i ? "none" : "1.6 1.6"}
          />
        ))}
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="0.15" className="stroke-slate-200" />
      </svg>

      {/* hub */}
      <div className="absolute start-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2">
        <div className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-primary-200 bg-card text-center shadow-card-hover">
          <LogoMark className="h-10 w-10" />
          <span className="px-3 text-[0.65rem] font-bold leading-tight text-primary-900">{systemName}</span>
        </div>
      </div>

      {/* module nodes */}
      {items.map((m, i) => (
        <div
          key={m.id}
          style={{ insetInlineStart: `${pos[i].x}%`, top: `${pos[i].y}%` }}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
        >
          <div
            className={cx(
              "flex min-w-28 max-w-36 cursor-default flex-col items-center rounded-xl border bg-card px-3 py-2.5 text-center shadow-card transition-all duration-200",
              active === i
                ? "-translate-y-1 border-royal-500 shadow-card-hover"
                : m.is_core
                  ? "border-primary-300"
                  : "border-slate-200",
            )}
          >
            <span className="text-[0.72rem] font-bold leading-tight text-primary-900">{m.name_ar}</span>
            {m.is_core && (
              <span className="mt-1 rounded-full bg-primary-50 px-2 py-px text-[0.55rem] font-semibold text-primary-700">
                أساسية
              </span>
            )}
          </div>

          {/* hover description */}
          {active === i && m.description_ar && (
            <div className="absolute start-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-xl border border-slate-200 bg-card p-3 text-center text-[0.68rem] leading-relaxed text-slate-500 shadow-card-hover rtl:translate-x-1/2">
              {m.description_ar}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
