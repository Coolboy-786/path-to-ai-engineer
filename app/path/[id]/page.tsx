"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PhaseAccordion from "@/components/PhaseAccordion";
import type { Task, Path, Phase, Progress, TaskStatus } from "@/lib/types";
import {
  getProgress,
  setProgress as saveProgress,
  getStartDate,
} from "@/lib/storage";
import { completionPercent, currentWeek } from "@/lib/utils";

import pathsData from "@/content/paths.json";
import phasesData from "@/content/phases.json";
import tasksData from "@/content/tasks.json";

const paths = pathsData as Path[];
const phases = phasesData as Phase[];
const tasks = tasksData as Task[];

export default function PathPage() {
  const params = useParams();
  const id = params.id as string;

  const [progress, setProgressState] = useState<Record<string, Progress>>({});
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loaded, setLoaded] = useState(false);

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

  const path = paths.find((p) => p.id === id);
  if (!path) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-slate-400">Path not found.</p>
      </div>
    );
  }

  const pathPhases = phases.filter((ph) => ph.pathId === id);
  const pathTasks = tasks.filter((t) =>
    pathPhases.some((ph) => ph.id === t.phaseId)
  );
  const totalPct = completionPercent(pathTasks, progress);
  const week = currentWeek(startDate);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: path.accent }}
          />
          <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">
            Learning Path
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: path.accent }}
        >
          {path.title}
        </h1>
        <p className="text-slate-400 text-base">{path.description}</p>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1 h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${totalPct}%`, backgroundColor: path.accent }}
            />
          </div>
          <span
            className="text-sm font-semibold tabular-nums shrink-0"
            style={{ color: path.accent }}
          >
            {totalPct}% complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-2xl font-bold text-white">{pathPhases.length}</p>
          <p className="text-xs text-slate-500 mt-1">Phases</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-2xl font-bold text-white">{pathTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">Tasks</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-2xl font-bold text-white">
            {pathPhases.filter((ph) => ph.certificate).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Certificates</p>
        </div>
      </div>

      <div className="space-y-3">
        {pathPhases.map((phase, idx) => {
          const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
          const isCurrentPhase = phase.weekNumbers.includes(week);
          return (
            <PhaseAccordion
              key={phase.id}
              phase={phase}
              tasks={phaseTasks}
              progress={progress}
              accent={path.accent}
              onStatusChange={handleStatusChange}
              defaultOpen={isCurrentPhase || idx === 0}
            />
          );
        })}
      </div>
    </div>
  );
}
