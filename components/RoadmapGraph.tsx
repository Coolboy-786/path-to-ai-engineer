"use client";

import Link from "next/link";
import type { Path } from "@/lib/types";

interface PathNode extends Path {
  pct: number;
  isActive: boolean;
}

interface Props {
  paths: PathNode[];
}

export default function RoadmapGraph({ paths }: Props) {
  const sorted = [...paths].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-center justify-between gap-0 min-w-[600px] px-4">
        {sorted.map((path, idx) => (
          <div key={path.id} className="flex items-center flex-1">
            <Link
              href={`/path/${path.id}`}
              className="group flex-1 max-w-[200px]"
            >
              <div
                className="relative rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  borderColor: path.isActive ? path.accent : `${path.accent}40`,
                  backgroundColor: `${path.accent}0d`,
                  boxShadow: path.isActive
                    ? `0 0 24px ${path.accent}30`
                    : "none",
                }}
              >
                {path.isActive && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: path.accent }}
                  >
                    You are here
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Phase {path.order}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: path.accent }}
                  >
                    {path.pct}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">
                  {path.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {path.description}
                </p>

                <div className="mt-3 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${path.pct}%`,
                      backgroundColor: path.accent,
                    }}
                  />
                </div>
              </div>
            </Link>

            {idx < sorted.length - 1 && (
              <div className="flex items-center px-1">
                <div className="h-0.5 w-8 bg-slate-700" />
                <svg
                  className="w-4 h-4 text-slate-600 -ml-1"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 8l5-5 1.4 1.4L7.8 8l2.6 2.6L9 12z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden space-y-3 px-1">
        {sorted.map((path, idx) => (
          <div key={path.id} className="flex gap-3 items-stretch">
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mt-6 shrink-0"
                style={{ backgroundColor: path.isActive ? path.accent : "#374151" }}
              />
              {idx < sorted.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-800 mt-1" />
              )}
            </div>
            <Link href={`/path/${path.id}`} className="flex-1">
              <div
                className="rounded-xl border p-4 transition-all"
                style={{
                  borderColor: path.isActive ? path.accent : `${path.accent}30`,
                  backgroundColor: `${path.accent}08`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-100">{path.title}</h3>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: path.accent }}
                  >
                    {path.pct}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${path.pct}%`, backgroundColor: path.accent }}
                  />
                </div>
                {path.isActive && (
                  <p className="text-xs mt-1.5" style={{ color: path.accent }}>
                    ← Current path
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
