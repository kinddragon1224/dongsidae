import { REGION_META } from "@/lib/history/regions";
import { REGIONS } from "@/lib/history/types";

const RING = [
  { r: 178, dash: "4 7", opacity: 0.55 },
  { r: 148, dash: "1 5", opacity: 0.4 },
  { r: 118, dash: "6 4", opacity: 0.5 },
  { r: 88, dash: "2 6", opacity: 0.35 },
] as const;

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const inner = i % 6 === 0 ? 168 : 174;
  return {
    i,
    x1: (200 + Math.cos(a) * inner).toFixed(2),
    y1: (200 + Math.sin(a) * inner).toFixed(2),
    x2: (200 + Math.cos(a) * 178).toFixed(2),
    y2: (200 + Math.sin(a) * 178).toFixed(2),
    major: i % 6 === 0,
  };
});

export function ChronosphereFallback() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="chronosphere-svg h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="cs-glow" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="rgb(232 226 214 / 0.16)" />
          <stop offset="55%" stopColor="rgb(232 226 214 / 0.03)" />
          <stop offset="100%" stopColor="rgb(232 226 214 / 0)" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#cs-glow)" />
      <g className="chronosphere-spin-slow" style={{ transformOrigin: "200px 200px" }}>
        {RING.map((ring) => (
          <circle
            key={ring.r}
            cx="200"
            cy="200"
            r={ring.r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray={ring.dash}
            opacity={ring.opacity}
          />
        ))}
        {TICKS.map((tick) => (
          <line
            key={tick.i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="currentColor"
            strokeWidth={tick.major ? 1.1 : 0.5}
            opacity={tick.major ? 0.55 : 0.25}
          />
        ))}
      </g>
      <g className="chronosphere-spin-mid" style={{ transformOrigin: "200px 200px" }}>
        {REGIONS.map((id, index) => {
          const start = index * 90 - 18;
          return (
            <circle
              key={id}
              cx="200"
              cy="200"
              r={128 - index * 14}
              fill="none"
              stroke={REGION_META[id].token}
              strokeWidth="1.2"
              strokeDasharray="42 260"
              strokeDashoffset={-start}
              opacity="0.7"
            />
          );
        })}
        <line
          x1="200"
          y1="62"
          x2="200"
          y2="338"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.28"
        />
        <line
          x1="62"
          y1="200"
          x2="338"
          y2="200"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.28"
        />
      </g>
      <circle
        cx="200"
        cy="200"
        r="54"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <circle cx="200" cy="200" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
