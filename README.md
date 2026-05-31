<div align="center">

# 栞 Shiori

**The AI-powered study companion for serious students.**

[![GitHub stars](https://img.shields.io/github/stars/kaorii-ako/Shiori-v1?style=flat-square&color=afc6ff)](https://github.com/kaorii-ako/Shiori-v1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-shiori--v1.vercel.app-ff6b9d?style=flat-square)](https://shiori-v1.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/kaorii-ako/Shiori-v1/ci.yml?style=flat-square&label=build)](https://github.com/kaorii-ako/Shiori-v1/actions)

[**🎮 Try Demo**](https://shiori-v1.vercel.app/demo) · [📖 Docs](#-quick-start) · [🐛 Report Bug](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=bug_report.md) · [💡 Request Feature](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=feature_request.md)

</div>

---

## What is Shiori?

Shiori (栞, *bookmark* in Japanese) is an **open-source AI study companion** built for students who take their grades seriously. It combines AI-powered study tools, gamification, and productivity features into one beautiful dark-mode app.

**No subscription required for core features.** Bring your own free [Gemini API key](https://aistudio.google.com/apikey). Self-hostable in 5 minutes.

> 🎮 **[Try the live demo](https://shiori-v1.vercel.app/demo)** — no account, no API key needed.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Quiz Generator** | Generate MCQ quizzes from your notes with Gemini AI |
| 🃏 **AI Flashcards** | Auto-generate spaced repetition flashcard decks |
| 📊 **Grade Tracker** | Weighted grade calculator with GPA predictor |
| 📅 **Assignment Manager** | Due dates, priorities, completion tracking |
| 📝 **Markdown Notes** | Two-panel editor with live preview |
| 🎯 **Focus Mode** | Pomodoro timer with task linking |
| 🏆 **Leaderboard** | Compare XP and streaks with friends |
| 📈 **Analytics** | Study time, grade trends, completion rates |
| 🌱 **Habit Tracker** | Daily habit streaks with completion heatmap |
| 🗓 **Study Plans** | AI-generated day-by-day study schedules |
| 📚 **Syllabus Import** | Parse syllabi to auto-create assignments |
| ⌨️ **Keyboard Shortcuts** | Power-user navigation (gh, ga, gn, gq...) |
| 🎮 **Gamification** | XP system, levels (Freshman → Graduate), achievements |

---

## 🚀 Quick Start

### Option 1: Live demo (no setup)

👉 **[shiori-v1.vercel.app/demo](https://shiori-v1.vercel.app/demo)**

No account. No API key. Full experience.

### Option 2: Deploy to Vercel (1 click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkaorii-ako%2FShiori-v1&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Required%20for%20user%20accounts&project-name=shiori&repository-name=Shiori-v1)

### Option 3: Self-host locally

**Prerequisites:** Node.js 18+, free [Supabase](https://supabase.com) account, free [Gemini API key](https://aistudio.google.com/apikey)

```bash
# Clone
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1

# Configure
cp .env.example .env
# Edit .env with your Supabase URL + anon key

# Run Supabase schema
# → Open supabase/schema.sql in your Supabase SQL Editor and run it

# Install + start
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → click **Try Demo** or sign up.

### Environment Variables

| Variable | Required | Where to get |
|----------|----------|--------------|
| `VITE_SUPABASE_URL` | ✅ Yes | [supabase.com](https://supabase.com) → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | [supabase.com](https://supabase.com) → Settings → API |
| `VITE_GEMINI_API_KEY` | Optional | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free) |

---

## 🏗 Tech Stack

```
Frontend:   React 18 + Vite + Zustand
Database:   Supabase (PostgreSQL + Auth)
AI:         Google Gemini 1.5 Flash (client-side, BYOK)
Deployment: Vercel
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `g h` | Go to Home |
| `g a` | Go to Assignments |
| `g n` | Go to Notes |
| `g f` | Go to Flashcards |
| `g q` | Go to Quiz |
| `g g` | Go to Grades |
| `?` | Show all shortcuts |

---

## 📁 Project Structure

```
Shiori-v1/
├── client/               # React + Vite frontend
│   └── src/
│       ├── pages/        # 16 pages (Home, Assignments, Grades, Notes...)
│       ├── components/   # Shared components (Sidebar, GlassCard, AIChat...)
│       ├── stores/       # Zustand state management
│       ├── utils/        # theme.js, gemini.js, demoData.js
│       └── lib/          # supabase.js, db.js
├── server/               # Express.js backend (optional, for Stripe webhooks)
├── extension/            # Chrome MV3 extension
├── supabase/             # Database schema + setup guide
└── docs/                 # Screenshots, specs
```

---

## 🤝 Contributing

Contributions are welcome! Shiori is built by students for students.

1. Check [good first issues](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22)
2. Read [CONTRIBUTING.md](CONTRIBUTING.md)
3. Fork → branch → PR

---

## 📄 License

[MIT](LICENSE) — free for personal and commercial use.

---

<div align="center">

**Made with ❤️ by [Tawin Tangsukson](https://github.com/kaorii-ako)**

If Shiori helps you study better, please consider giving it a ⭐ — it means a lot!

</div>
