"use client";

import { useEffect, useState } from "react";
import type { Task, Path, Phase, Progress } from "@/lib/types";
import {
  getProgress,
  getStartDate,
  exportState,
  importState,
} from "@/lib/storage";
import {
  completionPercent,
  totalHoursLogged,
  weeklyHoursData,
  currentWeek,
} from "@/lib/utils";

import pathsData from "@/content/paths.json";
import phasesData from "@/content/phases.json";
import tasksData from "@/content/tasks.json";

const paths = pathsData as Path[];
const phases = phasesData as Phase[];
const tasks = tasksData as Task[];

export default function DashboardPage() {
  const [progress, setProgressState] = useState<Record<string, Progress>>({});
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loaded, setLoaded] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    async function load() {
      const [prog, sd] = await Promise.all([getProgress(), getStartDate()]);
      setProgressState(prog);
      setStartDate(sd);
      setLoaded(true);
    }
    load();
  }, []);

  async function handleExport() {
    const json = await exportState();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `path-to-ai-engineer-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importState(text);
      const [prog, sd] = await Promise.all([getProgress(), getStartDate()]);
      setProgressState(prog);
      setStartDate(sd);
      setImportError(null);
    } catch {
      setImportError("Invalid backup file. Please use a file exported from this app.");
    }
  }

  const week = currentWeek(startDate);
  const totalHours = totalHoursLogged(progress);
  const targetHours = week * 20;
  const weekData = weeklyHoursData(progress, startDate);
  const maxWeekHours = Math.max(...weekData.map((w) => w.hours), 20);

  const certPhases = phases.filter((ph) => ph.certificate);
  const earnedCerts = certPhases.filter((ph) => {
    const phaseTasks = tasks.filter((t) => t.phaseId === ph.id);
    return completionPercent(phaseTasks, progress) === 100;
  });

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Week {week} of 16 · All-time progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          >
            {exportDone ? "✓ Exported!" : "Export backup"}
          </button>
          <label className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors cursor-pointer">
            Import backup
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {importError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          {importError}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Hours logged"
          value={totalHours.toFixed(1) + "h"}
          sub={`of ${targetHours}h planned`}
          accent="#3B82F6"
        />
        <StatCard
          label="Tasks done"
          value={String(Object.values(progress).filter((p) => p.status === "done").length)}
          sub={`of ${tasks.length} total`}
          accent="#8B5CF6"
        />
        <StatCard
          label="Certificates"
          value={String(earnedCerts.length)}
          sub={`of ${certPhases.length} available`}
          accent="#F59E0B"
        />
        <StatCard
          label="Current week"
          value={`Week ${week}`}
          sub="of 16"
          accent="#10B981"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-200">Progress by Path</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paths.map((path) => {
            const phasesForPath = phases.filter((ph) => ph.pathId === path.id);
            const pathTasks = tasks.filter((t) =>
              phasesForPath.some((ph) => ph.id === t.phaseId)
            );
            const pct = completionPercent(pathTasks, progress);
            const doneTasks = pathTasks.filter(
              (t) => progress[t.id]?.status === "done"
            ).length;

            return (
              <a
                key={path.id}
                href={`/path/${path.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors block"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-200">{path.title}</h3>
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: path.accent }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: path.accent }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {doneTasks} / {pathTasks.length} tasks complete
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-200">
          Weekly Hours (vs 20h target)
        </h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-end gap-1.5 h-40">
            {weekData.map(({ week: w, hours }) => {
              const pct = (hours / maxWeekHours) * 100;
              const targetLine = (20 / maxWeekHours) * 100;
              const isCurrent = w === week;
              const isFuture = w > week;
              return (
                <div
                  key={w}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                  title={`Week ${w}: ${hours.toFixed(1)}h`}
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-500 relative"
                    style={{
                      height: `${Math.max(pct, isFuture ? 0 : 2)}%`,
                      backgroundColor: isFuture
                        ? "#1e293b"
                        : hours >= 20
                        ? "#10B981"
                        : isCurrent
                        ? "#3B82F6"
                        : "#334155",
                      minHeight: isFuture ? undefined : "2px",
                    }}
                  />
                  <span
                    className={`text-xs tabular-nums ${
                      isCurrent ? "text-blue-400 font-bold" : "text-slate-600"
                    }`}
                  >
                    {w}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#10B981] inline-block" />
              Target met (20h+)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#3B82F6] inline-block" />
              Current week
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#334155] inline-block" />
              Past weeks
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-200">Certificates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certPhases.map((ph) => {
            const earned = earnedCerts.includes(ph);
            const phaseTasks = tasks.filter((t) => t.phaseId === ph.id);
            const pct = completionPercent(phaseTasks, progress);
            return (
              <div
                key={ph.id}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  earned
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <span className="text-2xl">{earned ? "🏆" : "🎓"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">
                    {ph.certificate!.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ph.certificate!.provider}
                  </p>
                  {!earned && (
                    <div className="mt-2 h-1 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  {earned && (
                    <p className="text-xs text-amber-400 mt-1 font-medium">
                      Earned ✓
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
