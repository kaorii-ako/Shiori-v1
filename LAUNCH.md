# Shiori Launch Kit

Copy-paste these to launch. Post them in this order: Twitter/X first, then HN, then Product Hunt.

---

## Twitter / X Thread

**Tweet 1 (hook):**
```
I built an AI study companion that connects to Google Classroom, Gmail, and Calendar — then builds your study plan automatically.

No more manually tracking deadlines across 5 tabs.

Try it with zero setup → shiori-v1.vercel.app

Open source. MIT license. 🧵
```

**Tweet 2 (demo):**
```
Here's what it actually does:

→ Pulls every assignment from Google Classroom the moment it's posted
→ Scans Gmail for deadline emails you missed
→ Reads your Calendar so study blocks fit around your schedule
→ Gemini AI builds a day-by-day plan from all of it

Real data. Not a to-do app.
```

**Tweet 3 (feature):**
```
My favorite part: the AI chat knows your actual data.

Ask "what should I work on first?" — it looks at your deadlines, grades, and estimated hours.

Not generic advice. Specific to you.

(there's also a Pomodoro timer that knows which assignment you're studying for)
```

**Tweet 4 (CTA):**
```
It's completely free to self-host.

Just clone, add your Google + Gemini API keys, and run.

GitHub: github.com/kaorii-ako/Shiori-v1

If this would've helped you in school, please ⭐ — it helps other students find it.
```

---

## Hacker News — Show HN

**Title:**
```
Show HN: Shiori – open-source AI study planner that syncs Google Classroom, Gmail, and Calendar
```

**Body:**
```
I'm a student and I built Shiori because I kept missing assignments that were scattered across Google Classroom, emails from teachers, and my calendar.

What it does:
- Pulls assignments from Google Classroom API automatically
- Scans Gmail for deadline-related emails
- Reads Google Calendar to find free study blocks
- Gemini AI generates a personalized day-by-day study schedule
- AI chat that answers questions using your actual academic data
- Grade calculator with weighted categories
- Pomodoro timer that tracks which assignment you're working on

There's a demo mode that loads with sample data — no Google login or API keys needed to try it:
https://shiori-v1.vercel.app

Tech stack: React 18, Vite, Express, Zustand, Framer Motion, Google Gemini 1.5 Flash, Appwrite auth, Tailwind CSS. Deployed on Vercel.

GitHub: https://github.com/kaorii-ako/Shiori-v1

Self-hosting takes about 5 minutes with your own keys. MIT licensed.

Happy to answer any questions about the architecture or the Google API integration.
```

---

## Product Hunt

**Tagline:**
```
Your AI study companion — syncs Google Classroom, Gmail + Calendar automatically
```

**Description:**
```
Shiori (栞 = "bookmark" in Japanese) connects to your Google ecosystem and eliminates the mental overhead of academic planning.

**The problem:** Students track assignments across Google Classroom, teacher emails, calendar events, and handwritten notes. Things fall through the gaps.

**What Shiori does:**
🤖 Pulls every assignment from Google Classroom the moment it's posted
📧 Scans Gmail for deadline emails teachers send outside Classroom
📅 Reads your Calendar and slots study blocks into free time automatically
✨ Gemini AI builds a real day-by-day study plan from all your data
💬 AI chat that answers questions using your actual schedule
📊 Grade calculator with weighted category support
⏱ Pomodoro timer integrated with your active assignment

**Try it in 10 seconds** — click "Try Demo" at shiori-v1.vercel.app. No login. No setup. Full app with sample data.

**Self-host free forever** with your own Google + Gemini API keys. MIT licensed. Full source on GitHub.

Shiori Pro (฿199/month) adds unlimited AI, email reminders, PDF export, and grade predictions for students who want the hosted version.
```

**First comment (post this yourself right after launch):**
```
Hey Product Hunt! 👋

I'm Tawin, a student who built Shiori because I kept missing assignments.

The thing I'm most proud of is the AI chat — it actually knows your data. When you ask "what should I work on first?" it looks at your deadlines, the weights of assignments, and your estimated study hours. Not generic advice.

Try the demo at shiori-v1.vercel.app (no login needed) and let me know what you think. What feature would make you actually use this daily?
```

---

## Reddit Posts

**r/learnprogramming:**
```
Title: I built an open-source AI study planner that syncs Google Classroom, Gmail, and Calendar

I'm a student and built this because I kept missing assignments scattered across different platforms. 

It uses Google Classroom API, Gmail API, and Calendar API to pull all your deadlines automatically, then Gemini AI builds a personalized study schedule.

Demo (no login): shiori-v1.vercel.app
GitHub: github.com/kaorii-ako/Shiori-v1

Tech: React + Vite + Express + Google Gemini + Appwrite. MIT licensed.

Happy to answer questions about the Google API integration — that part was trickier than expected.
```

**r/reactjs:**
```
Title: Built a full-stack React app with Google API integrations — open source

Stack: React 18 + Vite + Zustand + Framer Motion + Express + Gemini AI

The interesting parts technically:
- Google OAuth flow with Classroom, Gmail, Calendar scopes
- Zustand store for offline-first state (works without backend in demo mode)
- Vercel serverless functions for AI endpoints
- Framer Motion for the glassmorphism UI animations

Live: shiori-v1.vercel.app | GitHub: github.com/kaorii-ako/Shiori-v1
```

---

## Discord / Communities to post in

- **Buildspace** Discord — #share-your-project
- **Indie Hackers** — post in "What are you building?" thread
- **Dev.to** — write a blog post: "How I built an AI study planner with Google APIs"
- **Thai developer communities** (Facebook groups: "JavaScript Thailand", "React Thailand")
- **Student Discord servers** — find servers for your school or region

---

## Awesome List PRs — highest ROI for GitHub stars

Each merged PR into an awesome list can drive 100-500 organic stars. Submit these in order.

### 1. awesome-xyz/awesome-productivity (highest priority)
PR to: https://github.com/awesome-xyz/awesome-productivity

Add under **AI Assistants** section:
```
- [Shiori](https://shiori-v1.vercel.app) – AI study companion that syncs Google Classroom, Gmail, and Calendar to generate personalized day-by-day study plans. Open source, MIT. ([GitHub](https://github.com/kaorii-ako/Shiori-v1))
```

Also add under **Pomodoro & Timers** section:
```
- [Shiori](https://shiori-v1.vercel.app) – Student productivity app with integrated Pomodoro timer that tracks which assignment you're currently studying. ([GitHub](https://github.com/kaorii-ako/Shiori-v1))
```

### 2. yantoumu/awesome-ai-tools-4
PR to: https://github.com/yantoumu/awesome-ai-tools-4

Add under **Educational AI Tools** → Students subsection:
```
| [Shiori](https://github.com/kaorii-ako/Shiori-v1) | Open-source AI study companion — syncs Google Classroom, Gmail & Calendar, generates personalized study plans via Gemini AI. Demo at shiori-v1.vercel.app | 🆓 |
```

### 3. balavenkatesh3322/awesome-AI-toolkit
PR to: https://github.com/balavenkatesh3322/awesome-AI-toolkit

Add under educational/productivity tools:
```
| Shiori | AI-powered student study planner with Google Classroom sync, Gemini AI study plans, and Pomodoro timer | https://github.com/kaorii-ako/Shiori-v1 | — |
```

### 4. Add GitHub topics (do this NOW — 2 minutes)
Go to: https://github.com/kaorii-ako/Shiori-v1
Click the ⚙️ gear next to "About" → add these topics:
```
google-classroom  ai-study-planner  gemini  react  student  open-source  productivity  study-planner  pomodoro  edtech
```
Topics are how GitHub's Explore page surfaces repos. This alone can drive 20-50 stars/week.

### 5. classroomio/classroomio community
Star them + open a Discussion: "Built Shiori — an open-source student study companion that complements ClassroomIO"
Link: https://github.com/classroomio/classroomio/discussions
They have 1500+ stars and an active community of educators and students.
