# Shiori — Codex Guide

Open-source AI study companion for students. React + Vite frontend, Express backend, Google Gemini AI.

## Commands

```bash
# Install all deps (root + client + server)
npm install

# Dev (runs both client :5173 and server :3001)
npm run dev

# Client only
cd client && npm run dev

# Server only
cd server && npm run dev

# Build
cd client && npm run build

# Type check
cd client && npm run lint
```

## Architecture

```
Shiori-v1/
├── client/               # React 18 + Vite frontend
│   └── src/
│       ├── pages/        # 15 pages (Home, Assignments, Grades, Notes, Flashcards, Quiz, Leaderboard…)
│       ├── components/   # GlassCard, Button, Sidebar, AIChat, PomodoroTimer, ShortcutModal…
│       ├── stores/       # Zustand stores (auth, assignments, grades, notes, flashcards, ui)
│       ├── hooks/        # useKeyboardShortcuts
│       ├── utils/        # gemini.js, pdfExport, icalExport, demoData, sounds
│       └── lib/          # api.js (axios), appwrite.js
├── server/               # Express.js backend
│   ├── routes/           # ai, auth, classroom, gmail, calendar, grades, stripe
│   └── services/         # Google OAuth wrappers
├── extension/            # Chrome MV3 extension
│   ├── manifest.json
│   ├── popup.html/js
│   ├── background.js
│   ├── content-classroom.js
│   └── icons/            # PNG icons (run node generate-icons.js to regenerate)
├── .env.example          # All required environment variables
└── LAUNCH.md             # Reddit/HN/Twitter/Product Hunt post copy
```

## Key Files

| File | Purpose |
|------|---------|
| `client/src/utils/gemini.js` | Client-side Gemini REST wrapper — bring-your-own-key |
| `client/src/utils/demoData.js` | Demo mode seed data (5 courses, assignments, grades, notes, flashcards) |
| `client/src/stores/index.js` | All Zustand stores with zustand/persist |
| `client/src/hooks/useKeyboardShortcuts.js` | Two-key nav shortcuts (gh, ga, gq, gl…) |
| `client/src/pages/Quiz.jsx` | AI Quiz Generator — MCQ from notes via Gemini |
| `client/src/pages/Leaderboard.jsx` | Social leaderboard — share codes, compare streaks |
| `client/src/pages/FocusMode.jsx` | Fullscreen distraction-free Pomodoro |
| `server/routes/ai.js` | Gemini endpoints (study plan, flashcards, chat) |

## Design System

Dark background: `#10141a` · Blue: `#afc6ff` / `#528dff` · Purple: `#e5b5ff` / `#c44dff`
Green: `#d7ffc5` / `#4dff91` · Pink: `#ff6b9d` · Orange: `#ffd6a0`

Fonts: `Space Grotesk` (headings) · `Manrope` (body) · `Press Start 2P` (retro) · `VT323`

All components use inline styles (no Tailwind classes in new components unless editing existing ones).

## Environment Variables

Copy `.env.example` → `.env` and fill in:

```
GEMINI_API_KEY        # aistudio.google.com/apikey (free)
GOOGLE_CLIENT_ID      # Google Cloud Console → OAuth 2.0
GOOGLE_CLIENT_SECRET
APPWRITE_ENDPOINT     # appwrite.io (free cloud tier)
APPWRITE_PROJECT_ID
SESSION_SECRET        # any random 32+ char string
```

Client-side Gemini key can be set in the app: **Settings → Gemini API Key**.

## Adding a New Page

1. Create `client/src/pages/YourPage.jsx`
2. Add route in `client/src/App.jsx` inside the protected `<Route element={<Layout />}>` block
3. Add nav item in `client/src/components/Sidebar.jsx` → `navItems` array
4. Add keyboard shortcut in `client/src/hooks/useKeyboardShortcuts.js` → `SHORTCUTS` array

## Demo Mode

Demo mode loads when user clicks "Try Demo" — no Google login or API keys needed.
All data comes from `client/src/utils/demoData.js`.
To add demo content for a new feature, add it to the relevant `DEMO_*` constant in that file.

## Good First Issues

Check [GitHub Issues](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22) for beginner-friendly tasks.

## Live Demo

https://shiori-v1.vercel.app — click "TRY DEMO", no account needed.
