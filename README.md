# DashboardMon — Usulan Perubahan Organisasi

A single-page dashboard for tracking organizational-change proposals (*usulan perubahan organisasi*) moving through validation at a government ministry's internal review bureau, before joint review with the civil service reform ministry and final enactment.

Each proposal moves through eight defined stages (initial review, document validation, revision at the originating unit, inter-ministerial scheduling, draft regulation discussion, public consultation, legal harmonization, and enactment), can be sent back for revision multiple times, and every stage change is logged with a timestamp and note.

## Features

- **Dashboard** — summary cards, a stage-by-stage bar chart colored by who currently owns the next action, and a sortable/filterable proposal table.
- **Proposal detail** — a round-by-round timeline (so repeated revisions are visually distinct), affected sub-unit list, per-round document table, and stage-transition actions with required notes.
- **Intake forms** — add a new proposal, record document receipt, record validation results.
- **Reports** — average revision rounds per originating unit, average dwell time per stage, overdue proposals, and which sub-units are targeted most often.
- Deadline tracking applies only to the stages under the review bureau's own control; other stages show elapsed time without a deadline marker.

## Tech stack

- React 18 + Vite
- Tailwind CSS (via CDN)
- Supabase (Postgres) as the shared backend for proposals, documents, and stage logs

## Getting started

### 1. Set up Supabase

1. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) to create the tables, the proposal-code sequence, and row-level security policies.
2. Run [`supabase/seed.sql`](./supabase/seed.sql) once to load the 12 sample proposals (optional).
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from **Project Settings → API**.

Only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are injected into the browser bundle (see `vite.config.js`). `SUPABASE_SECRET_KEY` is never read by the app. When deploying (e.g. Vercel), set the same two variables in the project's environment settings.

> Access is currently open: anyone with the site URL can read and edit data (there is no login yet). Deletes are soft deletes, and the database does not allow hard deletes from the app.

### 2. Run the app

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

To produce a production build:

```bash
npm run build
```

## License

MIT — see [LICENSE](./LICENSE).
