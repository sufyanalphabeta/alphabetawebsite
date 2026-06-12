/**
 * Stylized lightweight Libya map (single SVG path, no map library) with
 * pulsing markers for the cities where AlphaBeta clients operate.
 */
const CITIES = [
  { name: "طرابلس",  x: 24, y: 16 },
  { name: "مصراتة",  x: 38, y: 24 },
  { name: "بنغازي",  x: 67, y: 17 },
];

export function LibyaMap() {
  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-xl">
      <svg viewBox="0 0 100 90" className="w-full">
        {/* simplified national outline */}
        <path
          d="M 12 20
             L 22 13  L 30 17  L 36 22  L 44 26  L 52 27  L 58 22
             L 64 14  L 72 13  L 80 15  L 92 13
             L 94 30  L 95 55  L 90 78  L 60 86  L 38 87
             L 20 70  L 12 48  Z"
          className="fill-primary-50 stroke-primary-300"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* subtle interior grid dots */}
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 9 }).map((_, c) => {
            const x = 20 + c * 8;
            const y = 28 + r * 9;
            return <circle key={`${r}-${c}`} cx={x} cy={y} r="0.45" className="fill-primary-200" />;
          }),
        )}
        {/* city markers */}
        {CITIES.map((city) => (
          <g key={city.name}>
            <circle cx={city.x} cy={city.y} r="3.4" className="animate-pulse-dot fill-royal-500/25" />
            <circle cx={city.x} cy={city.y} r="1.6" className="fill-royal-500" />
          </g>
        ))}
      </svg>

      {/* labels (HTML for crisp Arabic text) */}
      {CITIES.map((city) => (
        <span
          key={city.name}
          dir="rtl"
          style={{ left: `${city.x}%`, top: `${city.y}%` }}
          className="absolute -translate-x-1/2 translate-y-2.5 rounded-full border border-slate-200 bg-card px-2.5 py-0.5 text-[0.68rem] font-bold text-primary-900 shadow-card"
        >
          {city.name}
        </span>
      ))}
    </div>
  );
}
