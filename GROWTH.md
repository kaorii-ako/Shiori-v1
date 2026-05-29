# Shiori Growth Checklist

**Each item here can directly add stars or revenue. Do them in order.**
Time estimates are realistic — these are not vague suggestions.

---

## 🔴 Do RIGHT NOW (30 min total)

### 1. Add GitHub repo topics (2 min)
Go to: https://github.com/kaorii-ako/Shiori-v1
Click ⚙️ gear next to "About" on the right panel → Topics:
```
google-classroom ai-study-planner gemini react student open-source productivity pomodoro edtech spaced-repetition
```
**Why:** GitHub Explore surfaces repos by topic. This alone can drive 20-50 organic stars/week.

---

### 2. Create good-first-issue labels (3 min)
Run this (needs a GitHub PAT with `repo` scope from github.com/settings/tokens):
```bash
GITHUB_TOKEN=your_token_here bash scripts/create-github-issues.sh
```
**Why:** Repos with `good first issue` labels get listed in GitHub's "Contribute" feature. Drives contributors → activity → stars.

---

### 3. Post to Reddit r/reactjs (15 min)
URL: https://reddit.com/r/reactjs/submit

**Title:**
```
Show r/reactjs: I built an open-source AI study companion — Classroom sync, SRS flashcards, GPA predictor, AI quiz generator (React + Gemini)
```

**Body:** (copy from LAUNCH.md → "r/reactjs body" section)

Post the same to **r/webdev** and **r/learnprogramming** — different titles, same body is fine.

**Best time:** Tuesday–Thursday, 9am–12pm EST

---

### 4. Post Show HN (10 min)
URL: https://news.ycombinator.com/submit

**Title:**
```
Show HN: Shiori – open-source AI study companion (React + Gemini, PWA, MIT)
```

**Body:** (copy from LAUNCH.md → "Hacker News" section)

**Best time:** Monday–Wednesday, 9am–11am EST — same day as Reddit for momentum.

---

## 🟡 Do THIS WEEK

### 5. Submit to awesome lists (PRs — high ROI, passive stars forever)

Each of these is a 5-min PR. Fork the repo, add one line, open a PR.

**Priority order:**

**a) awesome-react** — https://github.com/enaqx/awesome-react
Add under "Tools" or "Apps":
```markdown
- [Shiori](https://github.com/kaorii-ako/Shiori-v1) - Open-source AI study companion with Google Classroom sync, spaced repetition flashcards, and Gemini AI study plans.
```

**b) awesome-selfhosted** — https://github.com/awesome-selfhosted/awesome-selfhosted
Add under "Personal Dashboards" or "Learning & Courses":
```markdown
- [Shiori Study](https://shiori-v1.vercel.app) - AI-powered student productivity app. Google Classroom sync, Gemini AI study plans, SRS flashcards, GPA calculator, Pomodoro. ([Source Code](https://github.com/kaorii-ako/Shiori-v1)) `MIT` `Nodejs`
```

**c) awesome-ai-tools** — https://github.com/mahseema/awesome-ai-tools
Add under "Education":
```markdown
- [Shiori](https://github.com/kaorii-ako/Shiori-v1) - Open-source AI study companion. Paste your syllabus → AI extracts all assignments. Generate MCQ quizzes from notes. SRS flashcards. MIT.
```

**d) awesome-generative-ai** — https://github.com/steven2358/awesome-generative-ai
Add under "Education" or "Productivity":
```markdown
- [Shiori](https://github.com/kaorii-ako/Shiori-v1) - Student productivity app powered by Google Gemini. Generates study plans, flashcards, and MCQ quizzes from your notes.
```

---

### 6. AlternativeTo listing (10 min)
URL: https://alternativeto.net/software/add/
- Alternative to: Notion, Google Classroom, Anki
- Link: https://shiori-v1.vercel.app
- Description: "AI study companion — Google Classroom sync, Gemini AI plans, SRS flashcards, GPA calculator. Free & open source."

**Why:** AlternativeTo has high domain authority. Gets you organic search traffic forever.

---

### 7. Twitter/X thread (15 min)
Post the thread from LAUNCH.md → "Twitter / X Thread" section.
Tag: **@GoogleAI @vercel @reactjs**

---

### 8. Product Hunt launch (30 min — schedule for 12:01am PST)
URL: https://producthunt.com/posts/new
- Copy all content from LAUNCH.md → "Product Hunt" section
- Add screenshots from https://shiori-v1.vercel.app (take 3-4 screenshots)
- Upload demo GIF if you have one

**Why:** A good PH launch can drive 500-2000 stars in 24 hours.

---

## 💰 Revenue (10M THB path)

### 9. Set up Stripe (20 min — needed before any revenue)
See LAUNCH.md → "Stripe Setup" section. Step-by-step.
**At ฿199/month:** need 4,196 active subscribers
**At ฿3,990/month school tier:** need 209 schools

### 10. Set up Formspree for email waitlist (5 min)
1. Create free account at formspree.io
2. Create a new form, copy the form ID
3. Open `client/src/pages/Landing.jsx`
4. Find `xpwzqnyy` → replace with your real form ID

### 11. School outreach (ongoing)
Email Thai high schools and universities directly:
```
Subject: Free AI study companion for your students — open source

Hi,

I built Shiori, a free open-source AI study companion that syncs with Google Classroom.

Features: AI study plans, grade tracker, flashcards, Pomodoro timer.
Demo (no login): https://shiori-v1.vercel.app

Would your school be interested in a free trial of the School tier?

Best,
Tawin
```
Target: Bangkok schools with Google Workspace for Education accounts.

---

## 📊 Track progress

| Metric | Current | Target |
|--------|---------|--------|
| GitHub stars | ? | 5,000 |
| Email waitlist | 0 | 1,000 |
| Pro subscribers | 0 | 4,196 |
| School tier | 0 | 209 |

Check stars: https://github.com/kaorii-ako/Shiori-v1/stargazers
