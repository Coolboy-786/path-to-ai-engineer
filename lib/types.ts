export type PathId = "data-analyst" | "data-scientist" | "gen-ai" | "ai-engineer";

export interface Path {
  id: PathId;
  title: string;
  description: string;
  color: string;
  accent: string;
  order: number;
}

export interface Certificate {
  name: string;
  provider: string;
  url: string;
  estHours: number;
}

export interface Phase {
  id: string;
  pathId: PathId;
  title: string;
  weekNumbers: number[];
  summary: string;
  skills: string[];
  certificate?: Certificate;
}

export type TaskType = "daily" | "weekly" | "monthly";
export type TaskStatus = "todo" | "in-progress" | "done" | "skipped";

export interface Resource {
  title: string;
  url: string;
}

export interface Task {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  type: TaskType;
  estMinutes: number;
  resources: Resource[];
  week: number;
  day?: number;
}

export interface Progress {
  taskId: string;
  status: TaskStatus;
  completedAt?: string;
  actualMinutes?: number;
}

export type ApplicationPlatform = "LinkedIn" | "Naukri" | "Indeed" | "Wellfound" | "Other";
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  platform: ApplicationPlatform;
  status: ApplicationStatus;
  dateApplied: string;
  notes: string;
  link: string;
}

export interface AppState {
  progress: Record<string, Progress>;
  jobApplications: JobApplication[];
  startDate: string;
  manualJobsUnlock: boolean;
}
