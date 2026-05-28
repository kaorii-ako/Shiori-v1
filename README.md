<div align="center">

<h1>栞 Shiori</h1>

### *Your AI-powered study companion*

> **Shiori** (栞) means *bookmark* in Japanese — because every deadline deserves to be remembered.

[![Status](https://img.shields.io/badge/status-active%20development-brightgreen?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1)
[![MIT License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-afc6ff?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1/blob/master/.github/CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/kaorii-ako/Shiori-v1?style=for-the-badge&color=e5b5ff)](https://github.com/kaorii-ako/Shiori-v1/stargazers)

<br/>

**[🚀 Live Demo →](https://shiori-v1.vercel.app)**

<br/>

![Shiori App Preview](demo/preview.png) &nbsp;|&nbsp; **[⭐ Star this project](https://github.com/kaorii-ako/Shiori-v1)** &nbsp;|&nbsp; **[💜 Get Pro](https://shiori-v1.vercel.app/pro)**

</div>

---

## 🌸 What is Shiori?

Shiori is a **free, open-source AI productivity app** that connects to your Google ecosystem — Classroom, Gmail, and Calendar — and eliminates the mental overhead of academic planning. It reads your assignments, hunts down buried deadlines, and hands you a personalized study plan powered by **Google Gemini AI**.

No more manually tracking due dates across five different tabs. Shiori handles it.

```
┌─────────────────────────────────────────────────────────┐
│  Google Classroom  +  Gmail  +  Calendar                 │
│         ↓                ↓           ↓                   │
│              Shiori AI (Gemini)                          │
│                     ↓                                    │
│    Personalized study plan · AI chat · Grade tracker     │
└─────────────────────────────────────────────────────────┘
```

> **Your credentials stay local. No subscriptions to self-host. No data harvesting.**

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 🤖 | **AI Study Plans** | Gemini generates a real day-by-day schedule based on your actual deadlines |
| 📚 | **Google Classroom Sync** | Pulls in assignments and due dates the moment they're posted |
| 📧 | **Gmail Intelligence** | Scans your inbox and surfaces anything with a deadline |
| 📅 | **Calendar Integration** | Slots study blocks into your schedule automatically |
| 📊 | **Grade Calculator** | Track grades per course with weighted category support |
| 💬 | **AI Chat** | Ask Shiori anything about your schedule — it knows your data |
| 🎨 | **Midnight Study Room UI** | Dark glassmorphism aesthetic built for late-night studying |
| 🔓 | **Demo Mode** | Try everything with sample data — zero setup required |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- A Google Cloud project with Classroom + Gmail + Calendar APIs enabled
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)
- An [Appwrite](https://appwrite.io) instance (free cloud tier works)

### 1. Clone & install
```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
npm install
```

### 2. Set up your environment
```bash
cp .env.example .env
# Fill in your keys — see .env.example for full guide
```

Required variables:
```env
GEMINI_API_KEY=          # Google AI Studio
GOOGLE_CLIENT_ID=        # Google OAuth 2.0
GOOGLE_CLIENT_SECRET=    # Google OAuth 2.0
APPWRITE_ENDPOINT=       # Your Appwrite URL
APPWRITE_PROJECT_ID=     # Your Appwrite project
SESSION_SECRET=          # Any random string
```

### 3. Run
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

### ⚡ Try without any setup
Hit **"TRY DEMO"** on the login page — loads sample assignments, grades, and events instantly.
No Google account. No API keys. No Appwrite. See the full app in 10 seconds.

---

## ⚙️ How It Works

```
Student logs in via Google OAuth
        ↓
Shiori fetches from Google Classroom API (assignments, due dates)
Shiori fetches from Gmail API (deadline emails)
Shiori fetches from Google Calendar API (existing events)
        ↓
All data stored locally in Zustand state (never leaves your machine)
        ↓
Gemini AI processes → generates study plan + answers AI chat
        ↓
Dashboard shows: stats, upcoming tasks, AI suggestions
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Framer Motion, Tailwind CSS |
| **State** | Zustand with persistence |
| **Backend** | Express.js (Node.js) |
| **AI** | Google Gemini 1.5 Flash |
| **Auth** | Appwrite + Google OAuth 2.0 |
| **Google APIs** | Classroom, Gmail, Calendar (`googleapis`) |
| **Icons** | Lucide React |
| **Fonts** | Space Grotesk, Manrope, Press Start 2P |

---

## 📁 Project Structure

```
Shiori-v1/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # GlassCard, Button, Sidebar, AIChat...
│       ├── pages/             # Landing, Home, Assignments, Calendar, Grades, StudyPlans
│       ├── stores/            # Zustand state (auth, assignments, events, grades)
│       └── lib/               # Axios API client
├── server/                    # Express backend
│   ├── routes/                # ai, auth, classroom, gmail, calendar, grades
│   └── services/              # Google OAuth & API wrapper
├── .env.example               # Environment template — copy to .env
└── package.json               # Workspace root (npm workspaces)
```

---

## 🗺 Roadmap

- [x] **v1.0** — Core app: Classroom sync, Gmail, Calendar, AI plans, Grade tracker
- [x] **v1.1** — Demo mode (try Shiori without any setup)
- [x] **v1.1** — Public landing page + Pro pricing
- [ ] **v1.2** — Electron desktop app wrapper
- [ ] **v1.3** — Pomodoro timer integration
- [ ] **v1.4** — PDF export + iCal sync
- [ ] **v2.0** — Shiori Cloud (hosted, no setup needed)
- [ ] **v2.1** — Mobile app (React Native)
- [ ] Browser extension for quick task capture

**Have an idea?** [Open a feature request →](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=feature_request.md)

---

## 💜 Shiori Pro

Want the hosted version with no setup, unlimited AI, and premium features?

**[→ shiori-v1.vercel.app/pro](https://shiori-v1.vercel.app/pro)**

| | Free (Self-hosted) | Pro (Cloud) |
|---|---|---|
| Google Classroom sync | ✓ | ✓ |
| AI Study Plans | 5/month | Unlimited |
| AI Chat | 10/day | Unlimited |
| PDF Export | — | ✓ |
| Email Reminders | — | ✓ |
| Grade Predictions | — | ✓ |
| Price | Free forever | ฿199/month |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# Fork, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe what you added"
git push origin feature/your-feature-name
# Open a PR!
```

Please open an issue first if you're planning something big. See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for full guidelines.

Look for [`good first issue`](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22) if you're new here.

---

## 👤 Author

Built with care by **[@kaorii-ako](https://github.com/kaorii-ako)**

Got questions? Found a bug? [Open an issue](https://github.com/kaorii-ako/Shiori-v1/issues)

---

<div align="center">

*栞 — bookmark the things that matter.*

**If Shiori helps you study better, please give it a ⭐**

[![Star History Chart](https://api.star-history.com/svg?repos=kaorii-ako/Shiori-v1&type=Date)](https://star-history.com/#kaorii-ako/Shiori-v1)

</div>
