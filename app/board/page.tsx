"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TaskCard from "@/components/TaskCard";
import StreakBadge from "@/components/StreakBadge";
import HoursRing from "@/components/HoursRing";
import GlowCard from "@/components/GlowCard";
import type { Task, Path, Phase, Progress, TaskStatus } from "@/lib/types";
import {
  getProgress,
  setProgress as saveProgress,
  getStartDate,
} from "@/lib/storage";
import {
  currentWeek,
  currentDay,
  tasksForToday,
  tasksForThisWeek,
  tasksForThisMonth,
  streak,
  hoursThisWeek,
} from "@/lib/utils";

import pathsData from "@/content/paths.json";
import phasesData from "@/content/phases.json";
import tasksData from "@/content/tasks.json";

const paths = pathsData as Path[];
const phases = phasesData as Phase[];
const tasks = tasksData as Task[];

function getAccent(task: Task): string {
  const phase = phases.find((ph) => ph.id === task.phaseId);
  const path = paths.find((p) => p.id === phase?.pathId);
  return path?.accent ?? "#3B82F6";
}

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.3 } },
};

export default function BoardPage() {
  const [progress, setProgressState] = useState<Record<string, Progress>>({});
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loaded, setLoaded] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [prog, sd] = await Promise.all([getProgress(), getStartDate()]);
      setProgressState(prog);
      setStartDate(sd);
      setLoaded(true);
    }
    load();
  }, []);

  async function handleStatusChange(
    taskId: string,
    status: TaskStatus,
    actualMinutes?: number
  ) {
    const p: Progress = {
      taskId,
      status,
      completedAt: status === "done" ? new Date().toISOString() : undefined,
      actualMinutes,
    };
    await saveProgress(taskId, p);
    setProgressState((prev) => ({ ...prev, [taskId]: p }));
  }

  function handleReschedule(taskId: string) {
    setRescheduleMsg(`Task pushed forward. Update the task's day in content/tasks.json to persist.`);
    setTimeout(() => setRescheduleMsg(null), 4000);
  }

  const week = currentWeek(startDate);
  const day = currentDay(startDate);
  const todayTasks = tasksForToday(tasks, startDate);
  const weeklyTasks = tasksForThisWeek(tasks, startDate);
  const monthlyTasks = tasksForThisMonth(tasks, startDate);
  const currentStreak = streak(progress);
  const weekHours = hoursThisWeek(progress, startDate);
  const hoursPercent = Math.min(100, (weekHours / 20) * 100);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-violet-500"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 py-10 space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
            Daily Board
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">
            <span className="text-slate-300">Week {week}</span>
            {" · "}Day {day}
            {" · "}
            {new Date().toLocaleDateString("en-IE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge streak={currentStreak} />
          <HoursRing logged={weekHours} target={20} accent="#3B82F6" />
        </div>
      </div>

      {/* Reschedule msg */}
      {rescheduleMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-300"
        >
          {rescheduleMsg}
        </motion.div>
      )}

      {/* 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Column
          title="Today"
          subtitle={`Day ${day} tasks`}
          tasks={todayTasks}
          progress={progress}
          onStatusChange={handleStatusChange}
          onReschedule={handleReschedule}
          getAccent={getAccent}
          emptyText="All daily tasks done or none scheduled today."
          accent="#3B82F6"
        />
        <Column
          title="This Week"
          subtitle={`Week ${week} project work`}
          tasks={weeklyTasks}
          progress={progress}
          onStatusChange={handleStatusChange}
          getAccent={getAccent}
          emptyText="No weekly tasks this week."
          accent="#8B5CF6"
        />
        <Column
          title="This Month"
          subtitle="Monthly milestones"
          tasks={monthlyTasks}
          progress={progress}
          onStatusChange={handleStatusChange}
          getAccent={getAccent}
          emptyText="No monthly milestones this period."
          accent="#F59E0B"
        />
      </div>

      {/* Hours bar */}
      <GlowCard className="p-5 space-y-3" hover={false}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 font-mono">
            Weekly hours
          </h2>
          <span className="text-sm font-bold font-mono text-slate-300">
            {weekHours.toFixed(1)}
            <span className="text-slate-500"> / 20h</span>
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${hoursPercent}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              background:
                weekHours >= 20
                  ? "linear-gradient(90deg,#10B981,#34d399)"
                  : weekHours >= 10
                  ? "linear-gradient(90deg,#F59E0B,#fbbf24)"
                  : "linear-gradient(90deg,#3B82F6,#60a5fa)",
            }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {weekHours >= 20
            ? "Weekly target hit! Keep going 🎉"
            : `${(20 - weekHours).toFixed(1)}h remaining to hit 20h target`}
        </p>
      </GlowCard>
    </motion.div>
  );
}

interface ColumnProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  progress: Record<string, Progress>;
  onStatusChange: (id: string, status: TaskStatus, mins?: number) => void;
  onReschedule?: (id: string) => void;
  getAccent: (task: Task) => string;
  emptyText: string;
  accent: string;
}

function Column({
  title,
  subtitle,
  tasks,
  progress,
  onStatusChange,
  onReschedule,
  getAccent,
  emptyText,
  accent,
}: ColumnProps) {
  const done = tasks.filter((t) => progress[t.id]?.status === "done").length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 font-mono">
            {title}
          </h2>
          <span className="text-xs font-mono" style={{ color: accent }}>
            {done}/{tasks.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
        {tasks.length > 0 && (
          <div className="h-0.5 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ backgroundColor: accent }}
            />
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <GlowCard className="p-5 text-center" hover={false}>
          <p className="text-xs text-slate-500">{emptyText}</p>
        </GlowCard>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              progress={progress[task.id]}
              onStatusChange={onStatusChange}
              onReschedule={onReschedule}
              accent={getAccent(task)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
