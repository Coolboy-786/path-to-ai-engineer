"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase, Task, Progress, TaskStatus } from "@/lib/types";
import { cn, completionPercent } from "@/lib/utils";
import TaskCard from "./TaskCard";

interface Props {
  phase: Phase;
  tasks: Task[];
  progress: Record<string, Progress>;
  accent: string;
  onStatusChange: (taskId: string, status: TaskStatus, actualMinutes?: number) => void;
  defaultOpen?: boolean;
}

export default function PhaseAccordion({
  phase,
  tasks,
  progress,
  accent,
  onStatusChange,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = completionPercent(tasks, progress);

  const tasksByWeek: Record<number, Task[]> = {};
  tasks.forEach((t) => {
    if (!tasksByWeek[t.week]) tasksByWeek[t.week] = [];
    tasksByWeek[t.week].push(t);
  });

  return (
    <motion.div
      layout
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: open ? `${accent}30` : "rgba(148,163,184,0.08)",
        background: "rgba(15,23,42,0.6)",
        boxShadow: open ? `0 0 32px ${accent}0a` : "none",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-100 font-mono">{phase.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-mono">
              Wk {phase.weekNumbers[0]}–{phase.weekNumbers[phase.weekNumbers.length - 1]}
            </span>
            {pct === 100 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Complete ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {phase.summary}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ backgroundColor: accent }}
              />
            </div>
            <span
              className="text-xs font-bold tabular-nums font-mono shrink-0"
              style={{ color: accent }}
            >
              {pct}%
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {phase.skills.slice(0, 5).map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/40"
              >
                {s}
              </span>
            ))}
            {phase.skills.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-500">
                +{phase.skills.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {phase.certificate && (
            <span className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              🎓 Cert
            </span>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t p-5 space-y-6" style={{ borderColor: `${accent}20` }}>
              {phase.certificate && (
                <div
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: "rgba(245,158,11,0.2)",
                    background: "rgba(245,158,11,0.04)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300 font-mono">
                        {phase.certificate.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {phase.certificate.provider} · ~{phase.certificate.estHours}h
                      </p>
                      <a
                        href={phase.certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 mt-1 inline-block transition-colors cursor-pointer"
                      >
                        View certificate →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(tasksByWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([week, weekTasks]) => (
                  <div key={week}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 font-mono">
                      Week {week}
                    </h4>
                    <div className="space-y-2">
                      {weekTasks
                        .sort((a, b) => (a.day ?? 99) - (b.day ?? 99))
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            progress={progress[task.id]}
                            onStatusChange={onStatusChange}
                            accent={accent}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
