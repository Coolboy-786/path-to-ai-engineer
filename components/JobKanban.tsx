"use client";

import { useState } from "react";
import type { JobApplication, ApplicationStatus, ApplicationPlatform } from "@/lib/types";
import { cn, generateId, formatDate } from "@/lib/utils";

const COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "saved", label: "Saved", color: "#64748b" },
  { status: "applied", label: "Applied", color: "#3B82F6" },
  { status: "screening", label: "Screening", color: "#8B5CF6" },
  { status: "interview", label: "Interview", color: "#F59E0B" },
  { status: "offer", label: "Offer 🎉", color: "#10B981" },
  { status: "rejected", label: "Rejected", color: "#ef4444" },
];

const PLATFORMS: ApplicationPlatform[] = [
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Wellfound",
  "Other",
];

interface Props {
  applications: JobApplication[];
  onSave: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  platformFilter: ApplicationPlatform | "All";
  onFilterChange: (f: ApplicationPlatform | "All") => void;
}

interface FormState {
  company: string;
  role: string;
  platform: ApplicationPlatform;
  link: string;
  notes: string;
}

const emptyForm: FormState = {
  company: "",
  role: "",
  platform: "LinkedIn",
  link: "",
  notes: "",
};

export default function JobKanban({
  applications,
  onSave,
  onDelete,
  platformFilter,
  onFilterChange,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered =
    platformFilter === "All"
      ? applications
      : applications.filter((a) => a.platform === platformFilter);

  function handleSubmit() {
    if (!form.company || !form.role) return;
    const app: JobApplication = {
      id: editingId ?? generateId(),
      company: form.company,
      role: form.role,
      platform: form.platform,
      status: "saved",
      dateApplied: new Date().toISOString().split("T")[0],
      notes: form.notes,
      link: form.link,
    };
    onSave(app);
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }

  function handleStatusChange(app: JobApplication, status: ApplicationStatus) {
    onSave({ ...app, status });
  }

  function startEdit(app: JobApplication) {
    setForm({
      company: app.company,
      role: app.role,
      platform: app.platform,
      link: app.link,
      notes: app.notes,
    });
    setEditingId(app.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", ...PLATFORMS] as const).map((p) => (
            <button
              key={p}
              onClick={() => onFilterChange(p)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                platformFilter === p
                  ? "bg-slate-200 text-slate-900 border-transparent"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="text-sm px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
        >
          + Add Application
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            {editingId ? "Edit application" : "New application"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Company *"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
            <input
              placeholder="Role *"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as ApplicationPlatform }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              placeholder="Job link"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="text-sm px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COLUMNS.map((col) => {
          const colApps = filtered.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-slate-400">{col.label}</span>
                <span className="text-xs text-slate-600 ml-auto">{colApps.length}</span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs space-y-1 hover:border-slate-700 transition-colors cursor-pointer"
                    onClick={() => startEdit(app)}
                  >
                    <p className="font-semibold text-slate-200 leading-tight">{app.company}</p>
                    <p className="text-slate-400 leading-tight">{app.role}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-600">{app.platform}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
                        className="text-slate-700 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <select
                      value={app.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(app, e.target.value as ApplicationStatus)
                      }
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-300 focus:outline-none text-xs"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.status} value={c.status}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
