# Changelog

All notable changes to Shiori are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Firefox extension + Chrome Web Store release
- Shiori Cloud — fully hosted, no setup
- Mobile app — React Native / Expo

---

## [2.4.0] — 2026-05-31

### Added
- **Complete landing page redesign** — cinematic dark-minimal, product-first (huashu-design principles). Replaces 1115-line table-of-features with: animated app preview mockup, feature cards, 3-step onboarding, testimonials, pricing tiers
- **Custom domain** — live at [shiorii.tech](https://shiorii.tech)

### Fixed
- **Demo blank screen on refresh** — `Demo.jsx` now always re-initializes demo data regardless of persisted `isAuthenticated:true` in auth store. Guard changed from `if (isAuthenticated)` to `if (isAuthenticated && !isDemo)`. This fixes the root cause: non-persistent stores (assignments, events) were reset by page refresh while auth store persisted demo state
- **Login + Signup demo clicks** now route to `/demo` (consistent behavior, no duplicate data-loading logic)
- **URL migration** — all hardcoded `shiori-v1.vercel.app` replaced with `shiorii.tech` across 16 files: index.html, OG tags, sitemap, robots.txt, og-image.svg, FUNDING.yml, Stripe webhook, extension popup, API callbacks, LAUNCH.md

### Changed
- `client/package.json` — removed dead `appwrite` dependency (tree-shaken but listed as dep)
- CI workflow — `npm ci` → `npm install` (client lock file is gitignored; `npm ci` was failing silently)
- Login.jsx — removed 8 unused imports + duplicated demo data loading logic
- Signup.jsx — removed debug `console.log` from registration handler

---

## [2.3.0] — 2026-05-30

### Added
- `/demo` route — 1-click demo mode, no extra click needed
- `Demo.jsx` — auto-loads sample data + navigates to `/home` instantly
- CI badge in README

### Changed
- Vercel `buildCommand` → `npm install --prefix client && npm run build --prefix client` (fixes silent build failure since Supabase migration)
- All demo CTAs updated to `/demo` for 1-click access
- `supabase.js` — hardened against missing/whitespace env vars, wrapped in try/catch
- Vite `resolve.dedupe` for React/ReactDOM — prevents duplicate React crash in dev

### Fixed
- Live demo blank page (`TypeError: r.split is not a function`) — Vercel was serving stale Appwrite-era build
- Removed unused Appwrite import from `main.jsx` — ~13KB bundle reduction
- Dynamic `APP_URL` in OAuth callbacks — works on any Vercel preview URL

---

## [2.2.0] — 2026-05-29

### Added
- **Supabase migration** — replaced Appwrite with Supabase (PostgreSQL + Auth + RLS)
- GitHub OAuth + Google OAuth via `supabase.auth.signInWithOAuth()`
- `supabase/schema.sql` — full schema with Row Level Security, auto-profile trigger
- `client/src/lib/db.js` — CRUD sync layer for assignments, grades, notes, flashcards
- Docker — `docker compose up -d` launches full stack in < 30s
- `SemesterCard.jsx` — shareable PNG report card via Canvas API
- Star/Tweet CTAs on Home and Analytics pages
- `scripts/setup-github.sh` — sets GitHub topics + description via API
- `LAUNCH.md` — ready-to-post Reddit/HN/Product Hunt/Twitter copy
- Stripe webhook updates `profiles.is_pro` on subscribe/cancel
- Global `ErrorBoundary` — prevents blank-page crashes
- MCP server (`mcp/`) — 6 tools for Claude Code/Desktop integration

---

## [2.1.0] — 2026-05-28

### Added
- **Syllabus Import** page — paste any syllabus, Gemini extracts all assignments
- AI Note Summarizer
- SEO overhaul — OG tags, schema.org, sitemap.xml, robots.txt
- Student Leaderboard — compare study streaks via shareable base64 codes
- Focus Mode — fullscreen distraction-free Pomodoro with ambient orbs
- Habit Tracker — daily grid, streak, confetti on completion
- Analytics Dashboard — grade breakdown, heatmap, mastery tracking
- AI Quiz Generator — MCQ from notes in one click

---

## [1.1.0] — 2026-05-28

### Added
- **Landing page** — dark glassmorphism marketing page with feature showcase, app preview mockup, and pricing
- **Pro pricing page** (`/pro`) — Free vs Pro comparison, FAQ, annual/monthly billing toggle
- **OG meta tags** — `og:title`, `og:description` for better social sharing
- **Press Start 2P + VT323 fonts** — complete retro gaming aesthetic
- **Vercel deployment** — live at [shiorii.tech](https://shiorii.tech)
- **GitHub Actions CI** — automatic build verification on every push and PR
- **Chunk splitting** — Vite manualChunks for vendor/motion/ui bundles (better load time)
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options` via Vercel config

### Changed
- Routing restructured: `/` now shows Landing page (public), `/home` is the authenticated app
- `index.html` title updated to "Shiori — AI Study Companion"
- README rewritten with architecture diagram, Pro tier table, and star history

### Fixed
- Authenticated users visiting `/` redirect directly to `/home`
- Build artifacts (`client/dist/`) removed from git tracking

---

## [1.0.0] — 2026-05-27

### Added
- **Core app** — React 18 + Vite + Tailwind + Framer Motion frontend
- **Demo mode** — try the full app with sample data, zero setup required
- **Google Classroom sync** — pulls assignments and due dates via Classroom API
- **Gmail intelligence** — scans inbox for deadline-related emails
- **Google Calendar integration** — reads existing events for scheduling
- **AI study plans** — Gemini 1.5 Flash generates day-by-day schedule
- **AI chat** — context-aware assistant with access to your actual data
- **Grade calculator** — weighted grade tracking per course
- **Midnight Study Room UI** — dark glassmorphism design system
- **Appwrite auth** — Google OAuth 2.0 + email/password login
- **Zustand state** — persistent client-side state management
- **Express backend** — Node.js API server with Google OAuth flow
- **MIT license** + CONTRIBUTING.md + issue templates
