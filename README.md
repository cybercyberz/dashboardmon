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
- No backend — all data lives in React state for the session

## Getting started

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
