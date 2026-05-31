# Contributing to Shiori

Thank you for helping make studying better for students! Shiori is open source and built by the community.

## Getting Started

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
cp .env.example .env
# Leave VITE_SUPABASE_URL empty for demo mode — no Supabase needed!
npm install
cd client && npm run dev
```

Open http://localhost:5173 and click **Try Demo** — no API keys needed.

## Project Structure

```
client/src/
  pages/       # One file per route — edit the page you want to change
  components/  # Shared UI components
  stores/      # Zustand state — all app data lives here
  utils/
    theme.js   # Design tokens — colors, fonts, card style
    demoData.js # Demo mode seed data
    gemini.js  # Gemini AI wrapper
  lib/
    supabase.js # Supabase client
    db.js       # Database CRUD helpers
```

## Design Guidelines

**Colors and fonts** — always import from `utils/theme.js`:
```js
import { colors, fonts, card } from '../utils/theme'
// colors.bg, colors.blue, colors.purple, colors.text, etc.
```

**Inline styles only** on new components (the project uses inline styles, not Tailwind classes).

**Dark theme** — background `#10141a`, cards `#161b24`, borders `#2a3142`.

## Demo Mode

Your change must work in demo mode. Test by clicking "Try Demo" without any environment variables set. Demo data comes from `utils/demoData.js`.

## Commit Messages

Use conventional commits:
- `feat: add quiz timer feature`
- `fix: notes not saving on page refresh`
- `docs: update README setup steps`
- `chore: remove unused imports`

## Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Test in demo mode
5. Commit and push
6. Open a PR describing what you changed and why

## Finding Issues

Check [good first issues](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22) for beginner-friendly tasks.

## Questions?

Open a [GitHub Discussion](https://github.com/kaorii-ako/Shiori-v1/discussions) or an issue.
