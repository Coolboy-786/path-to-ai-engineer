"use client";

interface Props {
  streak: number;
}

export default function StreakBadge({ streak }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-4 py-2">
      <span className="text-orange-400 text-xl leading-none">🔥</span>
      <span className="text-orange-300 font-semibold tabular-nums">
        {streak}
      </span>
      <span className="text-orange-400/70 text-sm">day streak</span>
    </div>
  );
}
