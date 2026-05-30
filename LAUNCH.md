# Shiori — Launch Playbook

Ready-to-post content. Do these in order. Each takes < 10 minutes.

---

## 🔴 BEFORE POSTING — Do these first

### 1. Set Vercel env vars
Go to vercel.com/dashboard → Shiori → Settings → Environment Variables:
```
GEMINI_API_KEY        ← aistudio.google.com/apikey (free)
GOOGLE_CLIENT_ID      ← Google Cloud Console
GOOGLE_CLIENT_SECRET  ← Google Cloud Console
STRIPE_SECRET_KEY     ← dashboard.stripe.com/apikeys (use test key first)
STRIPE_PRICE_MONTHLY  ← create ฿199/month product in Stripe, copy price_* ID
STRIPE_WEBHOOK_SECRET ← Stripe webhook settings
SESSION_SECRET        ← any random 32-char string
```
After setting → click **Redeploy** on Vercel.

### 2. Add GitHub topics (2 min)
github.com/kaorii-ako/Shiori-v1 → ⚙️ gear → Topics:
`google-classroom ai-study-planner gemini react student open-source productivity pomodoro edtech`

**2. Post the Twitter/X thread below** (5 min)

**3. Submit to nologin.tools** (3 min) → email or submit form

---

Copy-paste these to launch. Post them in this order: Twitter/X first, then HN, then Product Hunt.
**Product Hunt timing: schedule for 12:01am Pacific. Reply to EVERY comment within minutes — this is the #1 ranking factor.**

---

## Twitter / X Thread

**Tweet 1 (hook):**
```
I built an AI study companion that connects to Google Classroom, Gmail, and Calendar — then builds your study plan automatically.

No more manually tracking deadlines across 5 tabs.

Try it with zero setup → shiori-v1.vercel.app/demo (no login, 1 click)

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

**Title (MCP angle — best for HN developer audience):**
```
Show HN: Shiori – MCP server for student productivity (assignments, grades, notes from Claude Code)
```

**Body:**
```
I'm a student who built Shiori — an open-source study companion with a built-in MCP server so Claude Code and Claude Desktop can read your academic data directly.

The MCP server (6 tools):
- get_study_summary — full snapshot: overdue work, this week's deadlines, GPA
- get_assignments — filter by course, status, days until due
- get_grades — per-course breakdown and cumulative GPA
- get_notes — list and read markdown notes per course
- add_assignment — create assignments from Claude
- get_flashcard_decks — SRS review status

Config (4 lines in ~/.claude.json):
{
  "mcpServers": {
    "shiori": {
      "command": "node",
      "args": ["/path/to/Shiori-v1/mcp/index.js"],
      "env": { "SHIORI_DATA_FILE": "/path/to/shiori-data.json" }
    }
  }
}

Beyond MCP, the web app (React + Gemini) has:
- Google Classroom sync — assignments pulled automatically
- AI study plans, AI quiz generator, AI note summarizer
- Paste your syllabus → Gemini extracts all assignments instantly
- Spaced repetition flashcards (SRS)
- Weighted GPA calculator + final exam predictor
- Pomodoro, habit tracker, student leaderboard, PWA

Demo (no login): https://shiori-v1.vercel.app
MCP server: https://github.com/kaorii-ako/Shiori-v1/tree/master/mcp
GitHub: https://github.com/kaorii-ako/Shiori-v1

MIT licensed, self-hosting takes ~5 min.
```

**Alternative title (broader appeal):**
```
Show HN: Shiori – open-source AI study companion with MCP server (React + Gemini, MIT)
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

**Try it in 10 seconds** — one click at shiori-v1.vercel.app/demo. No login. No setup. Full app with sample data.

**Self-host free forever** with your own Google + Gemini API keys. MIT licensed. Full source on GitHub.

Shiori Pro (฿199/month) adds unlimited AI, email reminders, PDF export, and grade predictions for students who want the hosted version.
```

**First comment (post this yourself right after launch):**
```
Hey Product Hunt! 👋

I'm Tawin, a student who built Shiori because I kept missing assignments.

The thing I'm most proud of is the AI chat — it actually knows your data. When you ask "what should I work on first?" it looks at your deadlines, the weights of assignments, and your estimated study hours. Not generic advice.

Try the demo at shiori-v1.vercel.app/demo (1 click, no login) and let me know what you think. What feature would make you actually use this daily?
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

Tech: React + Vite + Express + Google Gemini + Supabase (PostgreSQL). MIT licensed.

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

### 5. nologin.tools directory (submit today — free, instant traffic)
Shiori's demo mode qualifies: free, no login needed, education + productivity.
- Go to: https://nologin.tools (email them or find submit link in footer)
- Category: **Education** or **Productivity**
- Description to use:
```
AI study companion that syncs Google Classroom, Gmail, and Calendar to build personalized study plans.
Try the full app with demo data — no account, no API keys, no setup.
```
- Link: https://shiori-v1.vercel.app

### 6. AlternativeTo listing (90+ DA backlink = long-term organic traffic)
- Go to: https://alternativeto.net/software/add/
- Alternative to: Notion, Google Classroom, Todoist
- Description: "AI-powered student productivity app with Google Classroom sync, Gemini AI study plans, and Pomodoro timer. Free & open source."

### 7. Bluesky (outperforms X for small products right now)
```
Just shipped Shiori — an open source AI study companion for students.

It connects to your Google Classroom, Gmail, and Calendar. Gemini AI builds your study plan.

Try it with zero setup → shiori-v1.vercel.app/demo (1 click, no login)

Code: github.com/kaorii-ako/Shiori-v1
```

### 8. classroomio/classroomio community
Star them + open a Discussion: "Built Shiori — an open-source student study companion that complements ClassroomIO"
Link: https://github.com/classroomio/classroomio/discussions
They have 1500+ stars and an active community of educators and students.

---

## 📣 Reddit Posts (highest impact)

### r/reactjs title:
"I built an open-source AI study companion with React + Gemini — flashcards, GPA tracking, spaced repetition"

### r/reactjs body:
```
Hey r/reactjs!

Built Shiori (栞) — open-source AI study companion that replaces the chaos of managing deadlines across 5 tabs.

What it does:
- Google Classroom sync (assignments + due dates pulled automatically)
- Gemini AI generates personalized day-by-day study plans
- Weighted grade calculator + "what score do I need on the final?" predictor
- Spaced repetition flashcards with 3D card flip (Anki-style SRS)
- AI generates flashcards from your notes automatically
- Markdown notes per course with auto-save + live preview
- AI Quiz Generator: paste any text or open a note → Gemini makes MCQ quiz in seconds
- Syllabus Import: paste your course syllabus → Gemini extracts ALL assignments instantly
- Student Leaderboard: share study stats with friends via base64 codes
- Study analytics: grade breakdown, activity heatmap, mastery tracking
- Shareable GPA report card (Canvas PNG download)
- PWA — installable on phone
- Full demo mode, no account needed

Stack: React 18, Vite, Framer Motion, Zustand, Express, Google Gemini AI

Try it (no signup): https://shiori-v1.vercel.app
GitHub: https://github.com/kaorii-ako/Shiori-v1
```

Post same body to: r/webdev, r/learnprogramming, r/students

---

## 🐦 Twitter/X Thread

Tweet 1: "I built Shiori (栞) — open-source AI study companion that connects to your Google Classroom. No more juggling 5 tabs. Try free (no signup): shiori-v1.vercel.app — GitHub: github.com/kaorii-ako/Shiori-v1 🧵"

Tweet 2: "📚 Google Classroom sync → 🤖 Gemini AI study plans → 📊 Weighted grade calculator → 🎯 Final exam predictor ('What score do I need to get an A?')"

Tweet 3: "🃏 Spaced repetition flashcards with 3D flip. AI reads your notes → creates flashcards automatically. Import from Quizlet/Anki via CSV."

Tweet 4: "Also: Shareable GPA card • iCal export • PDF export • PWA • Markdown notes • Study analytics • Keyboard shortcuts. All free. All open source. ⭐ github.com/kaorii-ako/Shiori-v1"

---

## 🚀 Product Hunt

Tagline: "The AI study companion that actually reads your Google Classroom"

Description: "Shiori connects to Google Classroom + Gmail, Gemini AI builds a personalized study plan, spaced repetition flashcards + AI card generation from notes, weighted grade calculator, shareable GPA card. Full demo — no signup needed. Open source."

Maker comment: "Built this because I kept missing deadlines while managing 5 tabs. Most magical feature: click 'AI CARDS' in the Notes editor — Gemini reads your notes and creates flashcard Q&A pairs automatically. Looking for contributors! github.com/kaorii-ako/Shiori-v1"

---

## 💰 Stripe Setup (฿199/month Pro)

1. dashboard.stripe.com/products → New product → "Shiori Pro" → ฿199/month (THB)
2. Copy price_* ID → STRIPE_PRICE_MONTHLY in Vercel
3. dashboard.stripe.com/webhooks → Add endpoint: https://shiori-v1.vercel.app/api/webhook
4. Events: checkout.session.completed + customer.subscription.deleted
5. Copy webhook secret → STRIPE_WEBHOOK_SECRET in Vercel
6. Redeploy on Vercel

At ฿199/month: need 4,196 subscribers for 10M THB/year
At ฿3,990/month school tier: need 209 schools/year

---

## NEW POSTS — Supabase + Docker angle (2026-05-30 update)

### r/selfhosted (HIGHEST PRIORITY — this audience stars repos)
```
Title: Shiori – self-hosted AI study companion with Docker, Supabase auth, and Google Classroom sync

Just added Docker support to my open-source student productivity app.

docker compose up -d
# Done. Running at http://localhost

Stack:
- React 18 + Vite frontend (nginx)
- Express backend
- Supabase for auth (GitHub OAuth, Google OAuth, email/password) + PostgreSQL
- Gemini AI for study plans, quiz generation, flashcard creation

Features:
- Google Classroom sync (pulls assignments automatically)
- Weighted GPA calculator + final exam score predictor
- Spaced repetition flashcards (SRS like Anki)
- AI study plan generator + AI chat
- Pomodoro timer, habit tracker, leaderboard
- PWA (works offline on mobile)

All data stays on your Supabase instance. MIT licensed.

GitHub: https://github.com/kaorii-ako/Shiori-v1
Live demo (no login): https://shiori-v1.vercel.app
```

### r/webdev (Docker + Supabase angle)
```
Title: Migrated my React app from Appwrite to Supabase and added Docker — here's what changed

Just shipped a big update to my open-source student productivity app (Shiori):

- Replaced Appwrite with Supabase (PostgreSQL + Auth + RLS)
- GitHub OAuth / Google OAuth now via supabase.auth.signInWithOAuth()
- Full schema with Row Level Security — users only see their own data
- Docker compose for self-hosting (nginx + Express containers)
- Stripe webhook now updates is_pro in Supabase profiles table

The Supabase migration was ~200 lines changed. The RLS policies make auth really clean.

If you're on Appwrite and considering switching, happy to share what tripped me up.

GitHub: https://github.com/kaorii-ako/Shiori-v1
```

### awesome-selfhosted PR text
Fork: https://github.com/awesome-selfhosted/awesome-selfhosted
Add under **Education and Science** section:
```
- [Shiori](https://github.com/kaorii-ako/Shiori-v1) - AI study companion with Google Classroom sync, GPA calculator, spaced repetition flashcards, and AI study plan generator. `MIT` `Docker` `JavaScript`
```

