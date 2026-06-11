# Path to AI Engineer

A personal 16-week curriculum tracker: **Data Analyst → Data Scientist → GenAI → AI Engineer**

Built with Next.js 16, TypeScript, Tailwind CSS, and Framer Motion. Zero backend — all progress persists in localStorage via an async abstraction designed to swap to Supabase without touching a single page.

---

## Features

- **Roadmap graph** — visual 4-path journey with animated progress rings
- **Daily board** — Today / This Week / This Month task columns
- **Streak tracker** — consecutive day counter with badge
- **Dashboard** — completion stats, hours logged, bar chart, certificate tracker, export/import backup
- **Job hunt Kanban** — 5-column board (Saved → Applied → Interview → Offer → Rejected), unlocks at week 12
- **AI Chatbot** — streaming chat powered by Groq (llama-3.3-70b) for study Q&A
- **Dark theme** — mobile-responsive, animated UI throughout

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI SDK | `ai@4.3.19` + `@ai-sdk/groq@1.x` |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Storage | localStorage (Supabase-ready swap) |
| Deploy | Vercel |

---

## Run Locally

```bash
npm install
```

Create `.env.local`:
```env
GROQ_API_KEY=gsk_your_key_here
```

Get a free key at [console.groq.com](https://console.groq.com).

```bash
npm run dev
# → http://localhost:3000
```

Requires Node 18+.

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo
3. Vercel auto-detects Next.js — no build config needed
4. Add environment variable:
   - **Key:** `GROQ_API_KEY`
   - **Value:** your `gsk_...` key from [console.groq.com](https://console.groq.com)
5. Click **Deploy**

Every push to `main` auto-deploys.

---

## Edit the Curriculum

All content lives in `/content/`:

| File | What it controls |
|---|---|
| `paths.json` | 4 learning paths (title, accent color) |
| `phases.json` | Phase groupings (weeks, skills, certificate targets) |
| `tasks.json` | Every individual task (title, description, resources, week, day) |

**Add a task** — append to `tasks.json`:
```json
{
  "id": "unique-string",
  "phaseId": "da-phase-1",
  "title": "Actionable task title",
  "description": "What exactly to do",
  "type": "daily",
  "estMinutes": 120,
  "resources": [{ "title": "Resource name", "url": "https://..." }],
  "week": 1,
  "day": 1
}
```

Task types: `daily` (needs `week` + `day`), `weekly` (needs `week`), `monthly` (one per 4-week block).

---

## Pages

| Route | Description |
|---|---|
| `/` | Roadmap graph + today's tasks + streak |
| `/path/[id]` | Phase-by-phase breakdown for one learning path |
| `/board` | Daily driver: Today / This Week / This Month |
| `/dashboard` | Stats, bar chart, certificates, export/import backup |
| `/jobs` | Job hunt Kanban + application checklist (unlocks week 12) |

---

## Swap localStorage → Supabase

All storage goes through `lib/storage.ts`. Replace the function bodies — no page files change.

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run this SQL:
```sql
create table progress (
  task_id text primary key,
  status text not null,
  completed_at timestamptz,
  actual_minutes int
);

create table job_applications (
  id text primary key,
  company text,
  role text,
  platform text,
  status text,
  date_applied date,
  notes text,
  link text
);

create table app_state (
  key text primary key,
  value text
);
```

3. Install client: `npm install @supabase/supabase-js`

4. Replace function bodies in `lib/storage.ts` with Supabase calls

5. Add to Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Data Backup

Dashboard → **Export backup** downloads a JSON snapshot of all progress and job applications. **Import backup** restores from file.
