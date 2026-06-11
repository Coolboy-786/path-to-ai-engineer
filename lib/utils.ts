import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Task, Progress, AppState } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currentWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(16, Math.floor(diffDays / 7) + 1));
}

export function currentDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return (diffDays % 7) + 1;
}

export function tasksForToday(tasks: Task[], startDate: string): Task[] {
  const week = currentWeek(startDate);
  const day = currentDay(startDate);
  return tasks.filter(
    (t) => t.type === "daily" && t.week === week && t.day === day
  );
}

export function tasksForThisWeek(tasks: Task[], startDate: string): Task[] {
  const week = currentWeek(startDate);
  return tasks.filter((t) => t.type === "weekly" && t.week === week);
}

export function tasksForThisMonth(tasks: Task[], startDate: string): Task[] {
  const week = currentWeek(startDate);
  const month = Math.ceil(week / 4);
  return tasks.filter(
    (t) =>
      t.type === "monthly" &&
      Math.ceil(t.week / 4) === month
  );
}

export function completionPercent(
  tasks: Task[],
  progress: Record<string, Progress>
): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(
    (t) => progress[t.id]?.status === "done" || progress[t.id]?.status === "skipped"
  ).length;
  return Math.round((done / tasks.length) * 100);
}

export function streak(progress: Record<string, Progress>): number {
  const doneByDay: Record<string, boolean> = {};
  Object.values(progress).forEach((p) => {
    if (p.status === "done" && p.completedAt) {
      const day = p.completedAt.split("T")[0];
      doneByDay[day] = true;
    }
  });

  const days = Object.keys(doneByDay).sort().reverse();
  if (days.length === 0) return 0;

  let count = 0;
  const today = new Date().toISOString().split("T")[0];
  let cursor = today;

  for (const day of days) {
    if (day === cursor) {
      count++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split("T")[0];
    } else {
      break;
    }
  }
  return count;
}

export function totalHoursLogged(progress: Record<string, Progress>): number {
  return (
    Object.values(progress).reduce(
      (sum, p) => sum + (p.actualMinutes ?? 0),
      0
    ) / 60
  );
}

export function hoursThisWeek(
  progress: Record<string, Progress>,
  startDate: string
): number {
  const week = currentWeek(startDate);
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return (
    Object.values(progress)
      .filter((p) => {
        if (!p.completedAt) return false;
        const d = new Date(p.completedAt);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, p) => sum + (p.actualMinutes ?? 0), 0) / 60
  );
}

export function jobsUnlocked(startDate: string, manualUnlock: boolean): boolean {
  if (manualUnlock) return true;
  return currentWeek(startDate) >= 12;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function weeklyHoursData(
  progress: Record<string, Progress>,
  startDate: string
): { week: number; hours: number }[] {
  return Array.from({ length: 16 }, (_, i) => {
    const week = i + 1;
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const hours =
      Object.values(progress)
        .filter((p) => {
          if (!p.completedAt) return false;
          const d = new Date(p.completedAt);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum, p) => sum + (p.actualMinutes ?? 0), 0) / 60;

    return { week, hours };
  });
}
