<div align="center">

# 栞 Shiori v1

### *Your AI-powered study companion*

> **Shiori** (栞) means *bookmark* in Japanese — because every deadline deserves to be remembered.

[![Status](https://img.shields.io/badge/status-active%20development-brightgreen?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1)
[![MIT License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-afc6ff?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1/blob/master/.github/CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/kaorii-ako/Shiori-v1?style=for-the-badge&color=e5b5ff)](https://github.com/kaorii-ako/Shiori-v1/stargazers)

</div>

---

## 🌸 What is Shiori?

Shiori is a **free, open-source AI productivity app** that connects to your Google ecosystem — Classroom, Gmail, and Calendar — and does the mental overhead *for* you. It reads your assignments, hunts down buried deadlines, and hands you a personalized study plan powered by **Google Gemini AI** so you can stop organizing and start actually studying.

No more manually tracking due dates across five different tabs. Shiori handles it.

> **Your credentials stay local. No subscriptions. No data harvesting.**

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
| 🎨 | **Midnight Study Room UI** | Dark glassmorphism aesthetic. Makes late-night studying feel magical. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A Google Cloud project with Classroom, Gmail & Calendar APIs enabled
- (Optional) A **Gemini API key** for real AI study plans

### 1. Clone & install

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
npm install
```

### 2. Set up your environment

```bash
cp .env.example .env
```

Open `.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_key   # optional — enables real AI
```

**Where to get them:**
- Google OAuth → [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (enable Classroom, Gmail, Calendar APIs)
- Gemini API key → [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier available)

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), sign up, connect Google, and you're in.

---

## ⚙️ How It Works

```
[ Your Google Account ]
         │
         ▼
[ Shiori syncs Classroom + Gmail + Calendar ]
         │
         ▼
[ Gemini AI extracts deadlines, tasks & requirements ]
         │
         ▼
[ Personalized study plan generated ]
         │
         ▼
[ You study. Shiori worries about the rest. ]
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

---

## 📁 Project Structure

```
Shiori-v1/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # GlassCard, Button, Sidebar, AIChat...
│       ├── pages/             # Home, Assignments, Calendar, Grades, StudyPlans
│       ├── stores/            # Zustand state (auth, assignments, events)
│       └── lib/               # Axios API client
├── server/                    # Express backend
│   ├── routes/                # ai, auth, classroom, gmail, calendar, grades
│   └── services/              # Google OAuth & API wrapper
├── .env.example               # Environment template — copy to .env
└── package.json               # Workspace root (npm workspaces)
```

---

## 🗺 Roadmap

- [ ] **v1.1** — Demo mode (try Shiori without any setup)
- [ ] **v1.2** — Electron desktop app wrapper
- [ ] **v1.3** — Pomodoro timer integration
- [ ] **v2.0** — Mobile app (React Native)
- [ ] Export study plans to PDF / iCal
- [ ] Browser extension for quick task capture

**Have an idea?** [Open a feature request →](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=feature_request.md)

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to get involved:

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

Got questions? Found a bug? [Open an issue](https://github.com/kaorii-ako/Shiori-v1/issues) — happy to help.

---

<div align="center">

*栞 — bookmark the things that matter.*

**If Shiori helps you study better, please give it a ⭐**

</div>
