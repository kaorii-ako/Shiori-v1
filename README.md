<div align="center">

<img src="https://img.shields.io/badge/Shiori-栞-e5b5ff?style=for-the-badge&labelColor=0a0a14&color=e5b5ff" alt="Shiori">

# Shiori — AI Study Companion

**The open-source AI productivity app for students.**  
Connect Google Classroom, Gmail & Calendar. Get AI-powered study plans. Never miss a deadline.

[![MIT License](https://img.shields.io/badge/license-MIT-afc6ff?style=flat-square&labelColor=0a0a14)](LICENSE)
[![Stars](https://img.shields.io/github/stars/kaorii-ako/Shiori-v1?style=flat-square&labelColor=0a0a14&color=e5b5ff)](https://github.com/kaorii-ako/Shiori-v1/stargazers)
[![Issues](https://img.shields.io/github/issues/kaorii-ako/Shiori-v1?style=flat-square&labelColor=0a0a14&color=4ad778)](https://github.com/kaorii-ako/Shiori-v1/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-afc6ff?style=flat-square&labelColor=0a0a14)](https://github.com/kaorii-ako/Shiori-v1/blob/master/.github/CONTRIBUTING.md)
[![Node](https://img.shields.io/badge/node-%3E%3D18-4ad778?style=flat-square&labelColor=0a0a14)](https://nodejs.org)

[Features](#-features) · [Quick Start](#-quick-start) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Contributing](#-contributing)

</div>

---

## What is Shiori?

Shiori (栞 — Japanese for *bookmark*) is a **free, open-source AI study companion** built for students who use Google Workspace. It automatically syncs your assignments from Google Classroom, extracts deadlines from Gmail, and uses Gemini AI to generate personalized study schedules — all wrapped in a gorgeous dark glassmorphism UI inspired by a midnight Tokyo study session.

> **No subscriptions. No data harvesting. Your credentials stay local.**

---

## ✨ Features

### 🤖 Real AI Study Plans
Powered by Google Gemini. Shiori analyzes your deadlines, subject load, and available hours to generate a realistic, day-by-day study schedule — not just a generic template.

### 📚 Google Classroom Sync
Automatically pulls all your courses, assignments, due dates, and submission status. Works with any Google Workspace school account.

### 📧 Gmail Deadline Extraction
Scans emails from your teachers and Google Classroom notifications to surface deadlines you might have missed.

### 📅 Calendar Integration
Two-way sync with Google Calendar. Shiori can block out study sessions directly on your calendar, and shows your existing events alongside your assignments.

### 📊 Grade Calculator
Track grades per assignment, per category (homework/quiz/exam), and per course. Real-time GPA estimation with weighted categories.

### 💬 AI Chat Assistant
Ask Shiori anything about your schedule: *"What should I study this weekend?"*, *"When is my next Chemistry assignment due?"*, *"How many hours do I need to get an A in Math?"*

### 🎨 Midnight Study Room Aesthetic
Dark glassmorphism UI with neon purple/blue accents. Looks incredible on any screen. Designed to make late-night studying feel a little more magical.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- A **Google Cloud** project with Classroom, Gmail, and Calendar APIs enabled
- (Optional) A **Gemini API key** for AI features

### 1. Clone & install

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_key   # optional — enables real AI
```

**How to get credentials:**
- Google OAuth → [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- Gemini API key → [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier available)

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — sign up, connect Google, and you're in.

---

## 📸 Screenshots

> *Screenshots coming soon — star the repo and watch for the first stable release!*

The UI features:
- Deep space dark background (`#0a0a14`) with frosted glass panels
- Neon purple (`#e5b5ff`) and blue (`#afc6ff`) accents
- Space Grotesk + Manrope typography
- Framer Motion animations throughout
- Fully responsive (desktop-first, mobile-ready)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Framer Motion, Tailwind CSS |
| **State** | Zustand with persistence |
| **Routing** | React Router v6 |
| **Backend** | Express.js (Node.js) |
| **AI** | Google Gemini 1.5 Flash |
| **Auth** | Appwrite + Google OAuth 2.0 |
| **Google APIs** | Classroom, Gmail, Calendar (via `googleapis`) |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
Shiori-v1/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # GlassCard, Button, Sidebar, AIChat...
│       ├── pages/             # Home, Assignments, Calendar, Grades, StudyPlans
│       ├── stores/            # Zustand state (auth, assignments, events)
│       ├── services/          # Appwrite integration
│       └── lib/               # Axios API client
├── server/                    # Express backend
│   ├── routes/                # ai, auth, classroom, gmail, calendar, grades
│   └── services/              # Google OAuth & API wrapper
├── .env.example               # Environment template
└── package.json               # Workspace root
```

---

## 🗺 Roadmap

- [ ] **v1.1** — Demo mode (try Shiori without any setup)
- [ ] **v1.2** — Electron desktop app wrapper
- [ ] **v1.3** — Pomodoro timer integration
- [ ] **v1.4** — Assignment collaboration (share study plans)
- [ ] **v2.0** — Mobile app (React Native)
- [ ] Offline mode with sync-on-connect
- [ ] Browser extension for quick task capture
- [ ] Export study plans to PDF / iCal

**Have an idea?** [Open a feature request →](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=feature_request.md)

---

## 🤝 Contributing

Shiori is fully open source and contributions are welcome! Whether it's a bug fix, a new feature, or a design improvement — all PRs are appreciated.

```bash
# Fork → clone → create branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a PR!
```

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed guidelines.

**Good first issues:** Look for the [`good first issue`](https://github.com/kaorii-ako/Shiori-v1/issues?q=is%3Aissue+label%3A%22good+first+issue%22) label.

---

## 🛡 Privacy

Shiori runs **locally on your machine**. Your Google tokens are stored in `tokens.json` (gitignored). No data is sent to any third-party server other than Google's own APIs and Gemini (when you opt in).

---

## 📝 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">

Made with ☕ and late nights by [@kaorii-ako](https://github.com/kaorii-ako)

**If Shiori helps you study better, please give it a ⭐ — it means a lot!**

</div>
