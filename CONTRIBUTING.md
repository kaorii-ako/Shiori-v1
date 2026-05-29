# Contributing to Shiori

First off, **thank you** for considering contributing to Shiori! Every contribution, big or small, helps make studying better for students everywhere. 🎓

## Quick start

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
cd client && npm install
npm run dev
```

App runs at `http://localhost:5173`. Click **Try Demo** to explore without signing up.

## How to contribute

### 1. Find something to work on

- Browse [issues labeled `good first issue`](https://github.com/kaorii-ako/Shiori-v1/issues?q=is%3Aissue+label%3A%22good+first+issue%22) — perfect for first-timers
- Browse [issues labeled `help wanted`](https://github.com/kaorii-ako/Shiori-v1/issues?q=is%3Aissue+label%3A%22help+wanted%22) for higher-impact work
- Have a feature idea? Open an issue first to discuss it

### 2. Fork and branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/what-you-are-fixing
```

### 3. Make your change

- Keep changes focused — one PR per feature/fix
- Test in demo mode (click **Try Demo** on login screen)
- Test on mobile (open DevTools → responsive mode)

### 4. Open a PR

Push your branch and open a pull request against `master`. Fill in the PR template — what changed and how to test it.

---

## Project structure

```
client/src/
├── components/     # Shared UI (GlassCard, Button, Sidebar, ...)
├── pages/          # Route pages (Home, Grades, Flashcards, ...)
├── stores/         # Zustand state (index.js — single file)
├── hooks/          # useKeyboardShortcuts, etc.
├── lib/            # API client (api.js)
├── utils/          # Demo data, PDF export, Gemini client
└── styles/         # index.css (Tailwind + design tokens)
```

## Design system

| Token | Value |
|-------|-------|
| Background | `#10141a` |
| Blue accent | `#afc6ff` / `#528dff` |
| Purple accent | `#e5b5ff` / `#c44dff` |
| Green accent | `#d7ffc5` / `#4dff91` |
| Pink | `#ff6b9d` |
| Heading font | Space Grotesk |
| Body font | Manrope |
| Mono/retro | Press Start 2P, VT323 |

Use `GlassCard` for panels, `Button` for actions, inline styles matching the palette above.

## Adding a new page

1. Create `client/src/pages/YourPage.jsx`
2. Add route in `client/src/App.jsx`
3. Add nav item in `client/src/components/Sidebar.jsx` (`navItems` array)
4. Add keyboard shortcut in `client/src/hooks/useKeyboardShortcuts.js`
5. Add demo data in `client/src/utils/demoData.js` if applicable

## State management

All state lives in `client/src/stores/index.js` as Zustand stores:

| Store | Purpose |
|-------|---------|
| `useAuthStore` | User auth, demo mode |
| `useAssignmentsStore` | Assignments CRUD |
| `useGradesStore` | Grades + weighted categories |
| `useNotesStore` | Per-course markdown notes |
| `useFlashcardsStore` | Flashcard decks + SRS intervals |
| `useEventStore` | Calendar events |
| `usePomodoroStore` | Timer state |
| `useUIStore` | Sidebar, toasts, AI chat, theme |

## Coding style

- React functional components with hooks
- Inline styles using the design palette (no new CSS classes)
- `motion.div` from Framer Motion for animations
- No TypeScript (yet) — plain JS + JSDoc if needed

## Questions?

Open an issue with the `question` label or start a [GitHub Discussion](https://github.com/kaorii-ako/Shiori-v1/discussions).

---

**Built with ♥ for students everywhere.**
