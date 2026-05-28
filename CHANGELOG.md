# Changelog

All notable changes to Shiori are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Electron desktop app wrapper (v1.2)
- Pomodoro timer with session tracking (v1.3)
- PDF + iCal export for study plans (v1.4)
- Shiori Cloud hosted version (v2.0)
- Mobile app — React Native (v2.1)
- Browser extension for quick task capture

---

## [1.1.0] — 2026-05-28

### Added
- **Landing page** — dark glassmorphism marketing page with feature showcase, app preview mockup, and pricing
- **Pro pricing page** (`/pro`) — Free vs Pro comparison, FAQ, annual/monthly billing toggle
- **OG meta tags** — `og:title`, `og:description` for better social sharing
- **Press Start 2P + VT323 fonts** — complete retro gaming aesthetic
- **Vercel deployment** — live at [shiori-v1.vercel.app](https://shiori-v1.vercel.app)
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
