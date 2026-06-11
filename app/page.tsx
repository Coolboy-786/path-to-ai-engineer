"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import RoadmapGraph from "@/components/RoadmapGraph";
import TaskCard from "@/components/TaskCard";
import StreakBadge from "@/components/StreakBadge";
import GlowCard from "@/components/GlowCard";
import type { Task, Path, Progress, TaskStatus } from "@/lib/types";
import {
  getProgress,
  setProgress as saveProgress,
  getStartDate,
  initStateIfEmpty,
} from "@/lib/storage";
import {
  currentWeek,
  tasksForToday,
  completionPercent,
  streak,
} from "@/lib/utils";

import pathsData from "@/content/paths.json";
import phasesData from "@/content/phases.json";
import tasksData from "@/content/tasks.json";

const paths = pathsData as Path[];
const tasks = tasksData as Task[];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } },
};

export default function Home() {
  const [progress, setProgressState] = useState<Record<string, Progress>>({});
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      await initStateIfEmpty();
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

  const week = currentWeek(startDate);
  const todayTasks = tasksForToday(tasks, startDate);
  const currentStreak = streak(progress);

  const pathNodes = paths.map((path) => {
    const phasesForPath = phasesData.filter((ph) => ph.pathId === path.id);
    const tasksForPath = tasks.filter((t) =>
      phasesForPath.some((ph) => ph.id === t.phaseId)
    );
    const pct = completionPercent(tasksForPath, progress);
    const pathWeeks = phasesForPath.flatMap((ph) => ph.weekNumbers);
    const isActive =
      pathWeeks.length > 0 &&
      week >= Math.min(...pathWeeks) &&
      week <= Math.max(...pathWeeks);
    return { ...path, pct, isActive };
  });

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-2 items-center">
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* Hero */}
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Week {week} / 16
            </span>
            <span className="text-xs text-slate-500">
              {todayTasks.filter((t) => progress[t.id]?.status === "done").length}/
              {todayTasks.length} tasks done today
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-mono">
            Path to{" "}
            <span className="gradient-text">AI Engineer</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            16-week self-paced curriculum · Data Analyst → Data Scientist → GenAI → AI Engineer
          </p>
        </motion.div>

        {/* Roadmap */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-base font-semibold text-slate-300 font-mono">
            Your Roadmap
          </h2>
          <RoadmapGraph paths={pathNodes} />
        </motion.section>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks */}
          <motion.div variants={item} className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-300 font-mono">
                Today&apos;s Tasks
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {todayTasks.filter((t) => progress[t.id]?.status === "done").length}
                /{todayTasks.length}
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <GlowCard className="p-8 text-center" hover={false}>
                <p className="text-sm text-slate-500">
                  No daily tasks for today.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Check the{" "}
                  <a href="/board" className="text-blue-400 hover:underline cursor-pointer">
                    Board
                  </a>{" "}
                  for weekly and monthly work.
                </p>
              </GlowCard>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {todayTasks.map((task) => {
                  const phase = phasesData.find((ph) => ph.id === task.phaseId);
                  const path = paths.find((p) => p.id === phase?.pathId);
                  return (
                    <motion.div key={task.id} variants={item}>
                      <TaskCard
                        task={task}
                        progress={progress[task.id]}
                        onStatusChange={handleStatusChange}
                        accent={path?.accent ?? "#3B82F6"}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar stats */}
          <motion.div variants={item} className="space-y-3">
            <h2 className="text-base font-semibold text-slate-300 font-mono">Stats</h2>

            <GlowCard className="p-5 space-y-5" hover={false}>
              <StreakBadge streak={currentStreak} />

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">
                  Week
                </p>
                <p className="text-3xl font-bold text-white font-mono">
                  {week}
                  <span className="text-base text-slate-500"> / 16</span>
                </p>
              </div>

              <div className="space-y-3">
                {pathNodes.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 truncate pr-2">
                        {p.title}
                      </span>
                      <span
                        className="text-xs font-bold font-mono shrink-0"
                        style={{ color: p.accent }}
                      >
                        {p.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                        style={{ backgroundColor: p.accent }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
