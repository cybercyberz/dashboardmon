# DashboardMon — Project Documentation

Full technical reference for **DashboardMon** (`dashboardmon-biro-kotl`): what it does, how it's built, and how it's deployed — GitHub → Vercel → Supabase, end to end. For a short quick-start, see [README.md](./README.md). For behavioral guidance when working on this repo with Claude Code, see [CLAUDE.md](./CLAUDE.md).

## 1. Overview

DashboardMon tracks *usulan perubahan organisasi* (organizational-change proposals) inside an Indonesian government ministry, as they move through review at the ministry's internal bureau (Biro KOTL), joint review with the Ministry of State Apparatus Reform (PANRB), legal harmonization with the Ministry of Law and Human Rights (KUMHAM), and final enactment.

Each proposal moves through 8 fixed stages, can be sent back for revision any number of times (each cycle is a "round" / *putaran*), and every stage change is logged with a timestamp, actor, and note.

**Audience:** Biro KOTL bureau staff (who process proposals) and the proposing units themselves (who can check status).

**Current state:** open access — there is no login. Anyone with the URL can read and write data. See [§10 Known limitations](#10-known-limitations--gotchas).

## 2. Domain model / glossary

| Term | Meaning |
|---|---|
| **usulan** | A proposal, keyed by a human-readable code like `SETJEN-2026-001` (unit prefix + year + running number from a shared DB sequence). |
| **tahap** | One of 8 fixed stages, T1–T8, displayed with Roman numerals (I–VIII): T1 Telaah surat usulan, T2 Validasi dokumen, T3 Penyempurnaan di unit organisasi, T4 Penjadwalan & rapat PANRB, T5 Pembahasan rancangan permen, T6 Konsultasi publik, T7 Harmonisasi Kemenkumham, T8 Penetapan & pengundangan. |
| **posisi bola** | "Ball position" — whose desk the proposal is currently on: `BKO` (Biro KOTL, the bureau itself), `UNOR` (the proposing unit), `PANRB`, or `KUMHAM`. |
| **putaran** | Revision round. Increments every time a proposal is sent back; the proposal-detail timeline groups history by round. |
| **jenis perubahan** | Type of organizational change: `pembentukan` (formation), `penggabungan` (merger), `penghapusan` (dissolution), `perubahan_nomenklatur` (rename), `perubahan_tugas_fungsi` (change of duties/function). |
| **unor / unit terdampak** | The proposing Eselon-I unit (`unorKode`) and the list of affected Eselon-II sub-units. |

### Roles (client-side only — see §10)

| Role code | Label | Can do |
|---|---|---|
| `kepala_biro` | Kepala Biro KOTL | Default role. Read-mostly view. |
| `pelaksana_biro` | Pelaksana Biro KOTL | Only role that can see intake forms (`/formulir`), transition stages, bypass-transition, edit timeline dates, delete/restore proposals (`/recycle-bin`). |
| `unor` | Unit Organisasi Pengusul | View scoped to only its own unit's proposals, via a unit picker. |

### Stage transitions

The legal graph of which stage can move to which is defined once, in `TRANSITION_MAP` inside `src/App.jsx`, and enforced by `validateTransition`. A separate "bypass" panel (`BypassTransitionPanel`, `pelaksana_biro` only) allows a manual stage move outside that graph for edge cases, but the normal UI (`TransitionActions`) only ever offers moves `TRANSITION_MAP` says are legal.

## 3. Architecture

- **Stack:** React 18 + Vite 5, [wouter](https://github.com/molefrog/wouter) for routing, Tailwind CSS (compiled at build time via PostCSS — **not** loaded from a CDN, despite what the short README says), Supabase (`@supabase/supabase-js`) as the backend, `@vercel/analytics` for Web Analytics.
- **File layout:** almost the entire app is one file, `src/App.jsx` (~2,700 lines):
  1. Domain constants (units, stage list, transition labels, colors, etc.)
  2. Pure helper/domain functions (date math, `TRANSITION_MAP`, `validateTransition`, `applyTransition`, report aggregations)
  3. Presentational components (`Button`, `Modal`, `Timeline`, `ProposalTable`, `TransitionActions`, etc.)
  4. Page components (`DasborPage`, `DetailUsulanPage`, `FormulirPage`, `LaporanPage`, `RecycleBinPage`, `CetakRingkasanPage`)
  5. `export default function App()` — wraps everything in a wouter `<Router hook={useHashLocation}>` (hash-based routing — no server-side route config needed on Vercel) and renders `AppShell`, which owns all state.
  - `src/db.js` — Supabase data-access layer (see §4).
  - `src/supabaseClient.js` — Supabase client singleton (see §4).
  - `src/main.jsx` — mounts `<App/>` + `<Analytics/>`.
  - `src/index.css` — just the three `@tailwind` directives.
- **Routing (hash-based):**

  | Path | Page | Gate |
  |---|---|---|
  | `/` | `DasborPage` (Dashboard) | none |
  | `/usulan/:kode` | `DetailUsulanPage` | none (but content is further scoped for `unor` role) |
  | `/formulir` | `FormulirPage` (intake forms) | `role === "pelaksana_biro"`, else redirect to `/` |
  | `/laporan` | `LaporanPage` (Reports) | none |
  | `/recycle-bin` | `RecycleBinPage` | `role === "pelaksana_biro"`, else redirect to `/` |
  | anything else | — | redirect to `/` |

  `CetakRingkasanPage` (print summary) is not a route — it's always mounted, hidden, and only shown via a `print:` Tailwind variant when the user clicks "Cetak Ringkasan" (calls `window.print()`).

- **State management:** plain `useState`/`useEffect`/`useMemo` in `AppShell`, no Redux/Context/React Query. `AppShell` owns `usulanList`, `dokumenList`, `logs`, `loadState`, `role`, `unorViewingAs`, `darkMode`, filters/sort, etc., and passes handler functions down as props (prop drilling, no context providers). Every write handler follows the same pattern: validate with a pure domain function → call `db.js` → merge the server's returned row into local state → return `{ok, error}` for the UI to display. There is no optimistic UI update and no client-side cache — every read/write is a real round trip to Supabase.

## 4. Data layer

**`src/supabaseClient.js`:**
```js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError =
  !url || !key ? "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur (lihat .env.example)." : null;

export const supabase = supabaseConfigError ? null : createClient(url, key);
```
Reads only from `import.meta.env` (build-time injected — see §6), never `process.env` at runtime. If either var is missing, `supabase` is `null` and every `db.js` call throws the Indonesian error message above, which the UI surfaces via its error state.

**`src/db.js`** — thin CRUD layer, camelCase (app) ↔ snake_case (Postgres) translation, **no business logic**:

| Function | Table(s) | Notes |
|---|---|---|
| `fetchAll()` | `usulan`, `dokumen`, `logs` | Parallel fetch via `Promise.all`. `usulan` ordered by `created_at, kode`; `dokumen`/`logs` ordered by `id`. **The app depends on `logs` insertion order** (see schema comment in §5). |
| `nextUsulanSeq()` | — | Calls Postgres RPC `next_usulan_seq()` — a shared, race-safe counter for generating proposal codes. |
| `insertUsulan(usulan)` / `updateUsulan(kode, patch)` | `usulan` | Keyed by `kode` (text), not a numeric id. |
| `insertDokumen(dokumen)` / `updateDokumen(id, patch)` | `dokumen` | |
| `insertLog(log)` / `updateLog(id, patch)` | `logs` | `updateLog` is only used for retroactive date corrections on the timeline. |

One quiet but important rule: `toRow()` converts empty-string dates (`""`, the app's "no date" convention) to `null` before writing, and `fromDokumenRow()` converts `null` back to `""` on read, so `<input type="date">` never receives `null`.

## 5. Supabase

**Project:** `pcxwlkaytkgtjspoeezm` (from `SUPABASE_URL=https://pcxwlkaytkgtjspoeezm.supabase.co`).

**Schema** (`supabase/schema.sql`) — 3 tables:

- **`usulan`** — `kode text primary key`, `judul`, `unor_kode`, `unit_terdampak text[]`, `jenis_perubahan`, `tahap_saat_ini`, `posisi_bola`, `putaran int default 1`, `tanggal_masuk_tahap date`, `tanggal_usulan_awal date` (+ `..._edited_at`/`..._edited_by` audit columns), `status text default 'aktif'`, `catatan_terakhir text default ''`, `deleted_at date`, `deleted_by text`, `created_at timestamptz default now()`. No FK/enum constraints on `unor_kode`/`tahap_saat_ini`/etc. — validity is entirely client-side.
- **`dokumen`** — `id bigint identity primary key`, `usulan_kode text references usulan(kode)`, `putaran`, `jenis`, `versi int default 1`, `tanggal_terima date`, `status_validasi text default 'diterima'`, `catatan_validasi text default ''`, `validator_nama text default ''`, `tanggal_validasi date`.
- **`logs`** — `id bigint identity primary key`, `usulan_kode text references usulan(kode)`, `dari_tahap`, `ke_tahap`, `dari_posisi_bola`, `ke_posisi_bola`, `putaran int`, `tanggal date`, `keterangan text`, `oleh_siapa text`, `manual boolean default false`, `tanggal_edited_at date`, `tanggal_edited_by text`, `keterangan_edited_at date`, `keterangan_edited_by text`. On the Detail page's Lini Masa, Pelaksana Biro can edit both the date and the note (`keterangan`) of each entry; editing the note of the latest entry also syncs `usulan.catatan_terakhir`. For databases created before the `keterangan_edited_*` columns existed, `schema.sql` ends with idempotent `alter table ... add column if not exists` statements. Schema comment: *"Urutan id = urutan asli pencatatan; aplikasi bergantung pada urutan ini"* (id order = original recording order; the app depends on this).

Indexes: `dokumen_usulan_kode_idx`, `logs_usulan_kode_idx` (both on `usulan_kode`).

**Shared sequence / RPC:**
```sql
create sequence if not exists public.usulan_seq;

create or replace function public.next_usulan_seq()
returns bigint language sql security definer set search_path = public
as $$ select nextval('public.usulan_seq') $$;

grant execute on function public.next_usulan_seq() to anon, authenticated;
```
Used by `App.jsx` to build the running number in a new `kode` (race-safe across concurrent clients).

**Row-level security** — enabled on all three tables, identical policy set per table:
```sql
create policy "open select" on public.<t> for select to anon, authenticated using (true);
create policy "open insert" on public.<t> for insert to anon, authenticated with check (true);
create policy "open update" on public.<t> for update to anon, authenticated using (true) with check (true);
```
**There is no delete policy on any table** — hard deletes are impossible through the app's `anon`/`authenticated` roles by design. Deletion is soft-delete only, via `usulan.deleted_at`/`deleted_by`.

**Provisioning / re-provisioning:** run `supabase/schema.sql` then `supabase/seed.sql` (optional sample data, 12 proposals) once, either in the Supabase Dashboard's SQL Editor, or programmatically via the Management API:
```
POST https://api.supabase.com/v1/projects/{project-ref}/database/query
Authorization: Bearer <management-api-token>   # starts with sbp_, from supabase.com/dashboard/account/tokens
Content-Type: application/json

{"query": "<contents of schema.sql or seed.sql>"}
```
This is how it was applied in practice — the PostgREST anon/service keys in `.env.local` cannot run arbitrary DDL; only a Postgres direct connection or a Management API token can.

## 6. Environment variables

| Variable | In `.env.example` | Used by the app? | Where |
|---|---|---|---|
| `SUPABASE_URL` | yes | **Yes** | Injected into `import.meta.env.SUPABASE_URL` at build time |
| `SUPABASE_PUBLISHABLE_KEY` | yes | **Yes** | Injected into `import.meta.env.SUPABASE_PUBLISHABLE_KEY` at build time |
| `SUPABASE_SECRET_KEY` | yes | **No — never** | Not referenced anywhere in `vite.config.js` or app code |
| `SUPABASE_JWKS_URL` | yes | **No — never** | Unused; likely a placeholder for auth that was never built (see §10) |

`vite.config.js` is the enforcement point — it deliberately allowlists only two names:
```js
const env = loadEnv(mode, process.cwd(), "SUPABASE_");
define: {
  "import.meta.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL ?? ""),
  "import.meta.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY ?? ""),
}
```
Even if `SUPABASE_SECRET_KEY`/`SUPABASE_JWKS_URL` are present in the same `.env.local` (they are), they are never read here, so they can never end up in the browser bundle. `loadEnv(mode, cwd, "SUPABASE_")` bypasses Vite's default `VITE_`-prefix requirement, which is why these names have no `VITE_` prefix.

**On Vercel:** `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set for both Production and Preview environments. `SUPABASE_SECRET_KEY`/`SUPABASE_JWKS_URL` are intentionally never added to Vercel either.

## 7. Deployment (Vercel)

- **Project:** `dashboardmon`, team `cybercyberzs-projects`. Linked via `.vercel/project.json`:
  ```json
  {"projectId":"prj_Vo0PIXDzsIC0eGheMqlZGfCDoc6U","orgId":"team_ipwryvduLDUKl0U5r4t6FeP8","projectName":"dashboardmon"}
  ```
  (`.vercel/` is git-ignored — local link only; re-create with `vercel link --yes --project dashboardmon`.)
- **No `vercel.json`** — deployment relies entirely on Vercel's zero-config Vite auto-detection (`npm run build` → `dist/`).
- **Production alias:** `https://dashboardmon.vercel.app`
- **Redeploy:** `vercel --prod` (from the repo root, with the CLI authenticated and linked).
- **Env vars:** `vercel env ls` / `vercel env add <NAME> <production|preview>` / `vercel env rm`.
- **Analytics:** `@vercel/analytics`'s `<Analytics/>` is mounted in `src/main.jsx` — Vercel Web Analytics, no extra config needed.

## 8. GitHub / repository

- **Remote:** `https://github.com/cybercyberz/dashboardmon.git`
- **Branch model:** `master` is the default branch and is **not** branch-protected; most commits are pushed directly to it. At least one feature (`claude/brave-brown-war02l` → the Supabase migration) went through a PR merge instead.
- **History narrative** (oldest → newest):
  1. `55fe6c9` — initial commit, client-only prototype (localStorage-based)
  2. `50daf0a` — accessibility & UI hierarchy pass
  3. `e81f046` — UI/UX overhaul: dark mode, wouter routing, shared components, a11y, responsive
  4. `3c78263` — delete/restore proposals, manual stage-transition bypass, Roman-numeral stage display
  5. `7462a0b` — inline timeline date editing for `pelaksana_biro`
  6. `138d989` — Vercel Web Analytics
  7. `14eea8c` / `3714609` — **Use Supabase as the shared backend** (replaced localStorage; introduced `db.js`, `supabaseClient.js`, `supabase/schema.sql`+`seed.sql`), merged via PR #1
  8. `41b3c9e` — dev convenience scripts (`start.sh`/`stop.sh`), local WebStorm MCP config (`.mcp.json`)

## 9. Local development

```bash
npm install
cp .env.example .env.local     # fill in SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY
npm run dev                    # start Vite dev server
npm run build                  # production build → dist/
npm run preview                # preview the production build locally
```

Optional convenience scripts (not part of `npm` scripts):
```bash
./start.sh   # runs `npx vite` in the background, PID in .server.pid, log in server.log
./stop.sh    # stops it
```
Both `.server.pid` and `server.log` are git-ignored runtime artifacts.

## 10. Known limitations / gotchas

- **No real authentication.** The three-role dropdown (`RoleSwitcher`) is a purely client-side `useState` — it changes what the UI shows, nothing more. Supabase RLS grants `select`/`insert`/`update` to the `anon` role unconditionally (`using (true)`), so **any direct API call can read or write any row regardless of what the browser's role selector says.** Do not describe role checks in this app as a security boundary — they are a UX convenience only. `SUPABASE_SECRET_KEY`/`SUPABASE_JWKS_URL` sit unused in `.env.example`, suggesting real auth was planned but never implemented.
- **Hardcoded year.** The proposal-code template in `App.jsx`'s add-proposal handler embeds the literal `"2026"` — it is not derived from the current date or from the sequence. This will need a manual code change at year rollover.
- **No tests, no CI, no linter.** There is no `.github/workflows`, no ESLint/Prettier config, and no `test`/`lint` npm script. `vite build` succeeding on Vercel is the only automated gate before a change goes live.
- **Single-file frontend.** Essentially all UI and domain logic lives in `src/App.jsx` (~2,700 lines) — there is no per-component file split.
- **No delete policy in Supabase.** Hard deletes are blocked at the database level for `anon`/`authenticated`; the app only ever soft-deletes via `deleted_at`/`deleted_by`.
- **`logs` table has no explicit ordering column** beyond its identity `id` — the app relies on insertion order to reconstruct history, per the schema's own comment.
