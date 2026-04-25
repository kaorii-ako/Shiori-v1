<div align="center">

# 栞 Shiori v1

### *Your AI-powered study companion*

> **Shiori** (栞) means *bookmark* in Japanese — because every deadline deserves to be remembered.

[![Status](https://img.shields.io/badge/status-active%20development-brightgreen?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1)
[![JavaScript](https://img.shields.io/badge/JavaScript-91.5%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/kaorii-ako/Shiori-v1)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-unlicensed-lightgrey?style=for-the-badge)](https://github.com/kaorii-ako/Shiori-v1)

</div>

---

## 🌸 What is Shiori?

Shiori is a **desktop productivity app** that connects to your Google ecosystem — Classroom, Gmail, and Calendar — and does the mental overhead *for* you. It reads your assignments, hunts down buried deadlines, and hands you a personalized study plan so you can stop organizing and start actually studying.

No more manually tracking due dates across five different tabs. Shiori handles it.

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 🤖 | **AI-Powered Organization** | Automatically prioritizes your tasks by urgency and workload |
| 📚 | **Google Classroom Sync** | Pulls in assignments and deadlines the moment they're posted |
| 📧 | **Gmail Intelligence** | Scans your inbox and surfaces anything with a deadline |
| 📅 | **Calendar Integration** | Slots everything into your schedule without the manual drag-and-drop |
| 📊 | **Smart Study Plans** | Generates personalized recommendations based on your actual workload |
| ⏰ | **Deadline Extraction** | Never let a due date slip through the cracks again |

---

## 🛠 Tech Stack

```
JavaScript  ████████████████████░░  91.5%
CSS         █░░░░░░░░░░░░░░░░░░░░░   4.1%
HTML        ░░░░░░░░░░░░░░░░░░░░░░   0.3%
```

Built as a desktop app using **Node.js** and vanilla JavaScript — lightweight, fast, and no framework overhead.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** or yarn
- A Google account with access to Classroom, Gmail, and/or Calendar
- Google Cloud API credentials (see setup below)

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up Google API credentials**

> You'll need to do this once to connect Shiori to your Google account.

- Go to the [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (name it anything you like)
- Enable the following APIs:
  - ✅ Google Classroom API
  - ✅ Gmail API
  - ✅ Google Calendar API
- Navigate to **Credentials → Create Credentials → OAuth 2.0 Client ID**
- Download your credentials and add them to the app

**4. Launch Shiori**
```bash
npm start
```

---

## 🗂 Project Structure

```
Shiori-v1/
├── index.html          # Entry point
├── styles/             # CSS stylesheets
├── scripts/            # Core JavaScript logic
├── package.json        # Dependencies & scripts
└── README.md           # You are here
```

---

## ⚙️ How It Works

```
[ Your Google Account ]
         │
         ▼
[ Shiori syncs Classroom + Gmail + Calendar ]
         │
         ▼
[ AI extracts deadlines, tasks & requirements ]
         │
         ▼
[ Personalized study plan generated ]
         │
         ▼
[ You study. Shiori worries about the rest. ]
```

1. **Connect** your Google accounts on first launch
2. **Shiori syncs** your assignments, emails, and calendar events
3. **AI processes** everything to extract key dates and task details
4. **Your study plan** is generated and updated as things change
5. **Get recommendations** on what to tackle first, and when

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to get involved:

```bash
# 1. Fork the repo, then:
git checkout -b feature/your-feature-name

# 2. Make your changes, then:
git commit -m "feat: describe what you added"

# 3. Push and open a PR:
git push origin feature/your-feature-name
```

Please open an issue first if you're planning something big — happy to discuss before you dive in.

---

## 👤 Author

Built with care by **[@kaorii-ako](https://github.com/kaorii-ako)**

Got questions? Found a bug? [Open an issue](https://github.com/kaorii-ako/Shiori-v1/issues) — I don't bite.

---

<div align="center">

*栞 — bookmark the things that matter.*

**Last updated:** April 2026

</div>
