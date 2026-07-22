# Shiori (栞)

An AI study companion for students who actually care about their grades. Quizzes, flashcards, grade tracking, and study planning in one app — bring your own free Gemini API key, no subscription needed.

**[Try the demo](https://shiori-v1.vercel.app/demo)** — no account or API key required.

## Features

- AI quiz generator and spaced-repetition flashcards from your notes
- Weighted grade calculator with GPA prediction
- Assignment manager with due dates and priorities
- Markdown notes with live preview
- Pomodoro focus mode linked to tasks
- Study plans generated day-by-day from your syllabus
- Habit tracker, XP/leveling, and a friends leaderboard
- Keyboard-driven navigation (`g h`, `g a`, `g n`, `g q`...)

## Getting started

**Fastest:** just open the [demo](https://shiori-v1.vercel.app/demo).

**Deploy your own:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkaorii-ako%2FShiori-v1&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Required%20for%20user%20accounts&project-name=shiori&repository-name=Shiori-v1)

**Self-host:**

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
cp .env.example .env   # add your Supabase URL + anon key
npm install
npm run dev
```

You'll need a free [Supabase](https://supabase.com) project (URL + anon key from Settings → API) and, optionally, a free [Gemini API key](https://aistudio.google.com/apikey) for the AI features.

## Stack

React + Vite + Zustand on the frontend, Supabase for auth and data, Gemini 1.5 Flash for AI (called client-side with your own key), deployed on Vercel.

## Structure

```
Shiori-v1/
├── client/       React + Vite frontend
├── server/       Express backend (Stripe webhooks only)
├── extension/    Chrome MV3 extension
└── supabase/     DB schema + setup
```

## Contributing

PRs welcome. Start with [good first issues](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22) or read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — use it however you like.

---

Built by [Tawin Tangsukson](https://github.com/kaorii-ako). Star it if it's useful to you.
