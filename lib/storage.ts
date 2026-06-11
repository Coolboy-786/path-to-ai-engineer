import type { AppState, Progress, JobApplication } from "./types";

const KEY = "path-to-ai-engineer-state";

const defaultState: AppState = {
  progress: {},
  jobApplications: [],
  startDate: new Date().toISOString().split("T")[0],
  manualJobsUnlock: false,
};

// ─── SWAP POINT ──────────────────────────────────────────────────────────────
// To migrate to Supabase:
//   1. Replace getState/setState bodies with Supabase select/upsert calls
//   2. Replace exportState/importState with a Supabase backup endpoint
//   3. All callers remain identical — they only use the async API below
// ─────────────────────────────────────────────────────────────────────────────

async function getState(): Promise<AppState> {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

async function setState(state: AppState): Promise<void> {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProgress(): Promise<Record<string, Progress>> {
  const s = await getState();
  return s.progress;
}

export async function setProgress(
  taskId: string,
  progress: Progress
): Promise<void> {
  const s = await getState();
  s.progress[taskId] = progress;
  await setState(s);
}

export async function getJobApplications(): Promise<JobApplication[]> {
  const s = await getState();
  return s.jobApplications;
}

export async function setJobApplication(app: JobApplication): Promise<void> {
  const s = await getState();
  const idx = s.jobApplications.findIndex((a) => a.id === app.id);
  if (idx >= 0) {
    s.jobApplications[idx] = app;
  } else {
    s.jobApplications.push(app);
  }
  await setState(s);
}

export async function deleteJobApplication(id: string): Promise<void> {
  const s = await getState();
  s.jobApplications = s.jobApplications.filter((a) => a.id !== id);
  await setState(s);
}

export async function getStartDate(): Promise<string> {
  const s = await getState();
  return s.startDate;
}

export async function setStartDate(date: string): Promise<void> {
  const s = await getState();
  s.startDate = date;
  await setState(s);
}

export async function getManualJobsUnlock(): Promise<boolean> {
  const s = await getState();
  return s.manualJobsUnlock;
}

export async function setManualJobsUnlock(val: boolean): Promise<void> {
  const s = await getState();
  s.manualJobsUnlock = val;
  await setState(s);
}

export async function exportState(): Promise<string> {
  const s = await getState();
  return JSON.stringify(s, null, 2);
}

export async function importState(json: string): Promise<void> {
  const parsed = JSON.parse(json) as AppState;
  await setState({ ...defaultState, ...parsed });
}

export async function initStateIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    await setState(defaultState);
  }
}
