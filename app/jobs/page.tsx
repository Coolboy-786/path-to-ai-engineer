"use client";

import { useEffect, useState } from "react";
import JobKanban from "@/components/JobKanban";
import type { JobApplication, ApplicationPlatform } from "@/lib/types";
import {
  getJobApplications,
  setJobApplication,
  deleteJobApplication,
  getStartDate,
  getManualJobsUnlock,
  setManualJobsUnlock,
} from "@/lib/storage";
import { jobsUnlocked, currentWeek } from "@/lib/utils";

const CHECKLIST = [
  {
    category: "LinkedIn (Global)",
    items: [
      "Headline: [Role] | [Skill 1] | [Skill 2] | Open to work",
      "About section: 3 paragraphs — who you are, what you build, what you're looking for",
      "All 4 projects in Featured section with live links",
      "Skills section: 10+ relevant skills with endorsements",
      "Turn on Open To Work (visible to recruiters or all)",
      "Connect with 5 AI Engineers/ML Engineers per week",
    ],
  },
  {
    category: "Naukri (India)",
    items: [
      "Resume headline: AI Engineer | LLM | RAG | Python",
      "Upload polished 1-page resume (PDF)",
      "Set job alerts: AI Engineer, ML Engineer, Data Scientist — Bangalore/Hyderabad/Remote",
      "Preferred location and expected salary filled",
      "All skills filled in profile",
    ],
  },
  {
    category: "Indeed / Wellfound (Ireland/EU)",
    items: [
      "Indeed IE profile complete with resume uploaded",
      "Wellfound (AngelList) profile: full AI Engineer profile with projects",
      "Wellfound: set desired role, compensation, and location preferences",
      "Indeed: job alerts for AI Engineer, ML Engineer in Ireland/Remote",
    ],
  },
  {
    category: "Preparation",
    items: [
      "2 mock interviews per week (Pramp or peer)",
      "1 LeetCode problem daily (NeetCode roadmap order)",
      "Behavioral STAR stories for 10 common questions written",
      "AI system design: 3 scenarios practiced out loud",
      "Portfolio site live on Vercel with 4 project cards",
      "Resume scored 80+ on Resume Worded",
    ],
  },
];

export default function JobsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [manualUnlock, setManualUnlock] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<ApplicationPlatform | "All">("All");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const [apps, sd, unlock] = await Promise.all([
        getJobApplications(),
        getStartDate(),
        getManualJobsUnlock(),
      ]);
      setApplications(apps);
      setStartDate(sd);
      setManualUnlock(unlock);
      setLoaded(true);
    }
    load();
  }, []);

  async function handleSave(app: JobApplication) {
    await setJobApplication(app);
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.id === app.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = app;
        return next;
      }
      return [...prev, app];
    });
  }

  async function handleDelete(id: string) {
    await deleteJobApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleUnlock() {
    await setManualJobsUnlock(true);
    setManualUnlock(true);
  }

  function toggleCheckItem(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const week = currentWeek(startDate);
  const unlocked = jobsUnlocked(startDate, manualUnlock);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-white">
          Job Hunt Unlocks at Week 12
        </h1>
        <p className="text-slate-400 leading-relaxed">
          You&apos;re on Week {week}. Focus on building your skills and projects first
          — you&apos;ll have much better results when you apply after completing the
          GenAI path. The job hunt module opens automatically at week 12.
        </p>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-slate-800 max-w-xs mx-auto">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${(week / 12) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{week} / 12 weeks to unlock</p>
        </div>
        <button
          onClick={handleUnlock}
          className="text-sm text-slate-600 hover:text-slate-400 transition-colors underline"
        >
          Unlock anyway (I&apos;m ready)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Job Hunt
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {applications.length} applications tracked ·{" "}
          {applications.filter((a) => a.status === "interview").length} in interview ·{" "}
          {applications.filter((a) => a.status === "offer").length} offers
        </p>
      </div>

      <JobKanban
        applications={applications}
        onSave={handleSave}
        onDelete={handleDelete}
        platformFilter={platformFilter}
        onFilterChange={setPlatformFilter}
      />

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-200">
          Profile & Preparation Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHECKLIST.map((section) => (
            <div
              key={section.category}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3"
            >
              <h3 className="text-sm font-semibold text-slate-200">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const checked = checkedItems[key] ?? false;
                  return (
                    <label
                      key={i}
                      className="flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                          checked
                            ? "bg-amber-500 border-amber-500"
                            : "border-slate-600 group-hover:border-slate-400"
                        }`}
                        onClick={() => toggleCheckItem(key)}
                      >
                        {checked && (
                          <svg
                            className="w-2.5 h-2.5 text-black"
                            fill="none"
                            viewBox="0 0 10 10"
                          >
                            <path
                              d="M1.5 5l2.5 2.5 4.5-4.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-xs leading-relaxed ${
                          checked
                            ? "line-through text-slate-600"
                            : "text-slate-300"
                        }`}
                      >
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
