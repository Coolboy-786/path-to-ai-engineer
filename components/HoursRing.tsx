"use client";

interface Props {
  logged: number;
  target?: number;
  size?: number;
  accent?: string;
}

export default function HoursRing({
  logged,
  target = 20,
  size = 80,
  accent = "#3B82F6",
}: Props) {
  const pct = Math.min(1, logged / target);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-lg font-bold tabular-nums leading-none" style={{ color: accent }}>
          {logged.toFixed(1)}h
        </p>
        <p className="text-xs text-slate-500">/ {target}h</p>
      </div>
    </div>
  );
}
