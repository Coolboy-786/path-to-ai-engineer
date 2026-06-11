"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Progress, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  progress?: Progress;
  onStatusChange: (taskId: string, status: TaskStatus, actualMinutes?: number) => void;
  onReschedule?: (taskId: string) => void;
  accent?: string;
}

export default function TaskCard({
  task,
  progress,
  onStatusChange,
  onReschedule,
  accent = "#3B82F6",
}: Props) {
  const [showHours, setShowHours] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [expanded, setExpanded] = useState(false);

  const status = progress?.status ?? "todo";
  const isDone = status === "done";
  const isSkipped = status === "skipped";

  function handleCheck() {
    if (isDone) {
      onStatusChange(task.id, "todo");
    } else {
      setShowHours(true);
    }
  }

  function handleLogTime() {
    const mins = parseInt(minutes) || task.estMinutes;
    onStatusChange(task.id, "done", mins);
    setShowHours(false);
    setMinutes("");
  }

  function handleSkip() {
    onStatusChange(task.id, "skipped");
  }

  const typeConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    daily:   { label: "daily",   bg: "rgba(59,130,246,0.08)",  text: "#60a5fa", border: "rgba(59,130,246,0.2)"  },
    weekly:  { label: "weekly",  bg: "rgba(139,92,246,0.08)",  text: "#a78bfa", border: "rgba(139,92,246,0.2)"  },
    monthly: { label: "monthly", bg: "rgba(245,158,11,0.08)", text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
  };

  const type = typeConfig[task.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDone || isSkipped ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border transition-all duration-200 group",
        isDone || isSkipped
          ? "border-slate-800/60 bg-slate-900/40"
          : "border-slate-700/40 bg-slate-900/70 hover:border-slate-600/60 hover:bg-slate-900"
      )}
      style={
        !isDone && !isSkipped
          ? { boxShadow: `0 0 0 0 ${accent}00` }
          : undefined
      }
      whileHover={
        !isDone && !isSkipped
          ? { boxShadow: `0 0 16px ${accent}12` }
          : undefined
      }
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <motion.button
          onClick={handleCheck}
          whileTap={{ scale: 0.85 }}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer",
            isDone
              ? "border-transparent"
              : "border-slate-600 hover:border-slate-400 group-hover:border-slate-500"
          )}
          style={isDone ? { backgroundColor: accent, borderColor: accent } : {}}
          aria-label={isDone ? "Mark as incomplete" : "Mark as done"}
        >
          <AnimatePresence>
            {isDone && (
              <motion.svg
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 12 12"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: type.bg,
                color: type.text,
                border: `1px solid ${type.border}`,
              }}
            >
              {type.label}
            </span>
            <span className="text-xs text-slate-500">
              {task.estMinutes >= 60
                ? `~${(task.estMinutes / 60).toFixed(1)}h`
                : `~${task.estMinutes}m`}
            </span>
            {progress?.actualMinutes && (
              <span className="text-xs text-slate-600">
                · logged {progress.actualMinutes}m
              </span>
            )}
          </div>

          {/* Title */}
          <p
            className={cn(
              "text-sm font-medium leading-snug transition-all",
              isDone
                ? "line-through text-slate-500"
                : isSkipped
                ? "line-through text-slate-600"
                : "text-slate-200"
            )}
          >
            {task.title}
          </p>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {task.description}
                  </p>
                  {task.resources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.resources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-500 transition-all duration-150 cursor-pointer"
                        >
                          {r.title} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions row */}
          <div className="flex items-center gap-3 pt-0.5">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {expanded ? "↑ Less" : "↓ Details + resources"}
            </button>
            {status !== "done" && status !== "skipped" && (
              <>
                <button
                  onClick={handleSkip}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                >
                  Skip
                </button>
                {onReschedule && (
                  <button
                    onClick={() => onReschedule(task.id)}
                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    Push →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Hours entry */}
          <AnimatePresence>
            {showHours && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder={`${task.estMinutes} min (estimated)`}
                    className="flex-1 text-sm bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleLogTime()}
                  />
                  <motion.button
                    onClick={handleLogTime}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm px-3 py-1.5 rounded-lg font-medium text-white transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    Done ✓
                  </motion.button>
                  <button
                    onClick={() => setShowHours(false)}
                    className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
