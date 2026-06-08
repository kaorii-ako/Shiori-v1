# Shiori — Setup Guide

This gets you a **real, usable** Shiori: real accounts, Google Sign-In, and live
Google Classroom sync. The whole stack is **Supabase (auth + database) + a static
client** — no always-on server required. You can run it locally or deploy to Vercel.

There are three things to set up, in order:

1. **Supabase** — accounts + your data
2. **Google Cloud** — the OAuth app that powers "Sign in with Google" + Classroom
3. **Connect them** — paste the Google credentials into Supabase, set the app's two env vars

Budget ~15 minutes the first time.

---

## 1. Supabase (accounts + database)

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This creates
   all tables and the row-level-security policies (each user only sees their own data).
3. Go to **Project Settings → API** and copy:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon public** key → this is `VITE_SUPABASE_ANON_KEY`
4. Go to **Authentication → URL Configuration** and add your app URLs to **Redirect URLs**:
   - `http://localhost:5173/auth/callback` (for local dev)
   - `https://YOUR-DOMAIN/auth/callback` (for production, e.g. your Vercel URL)

---

## 2. Google Cloud (the OAuth app + Classroom API)

1. Go to <https://console.cloud.google.com> and create (or pick) a project.
2. **APIs & Services → Library →** search **"Google Classroom API"** → **Enable**.
3. **APIs & Services → OAuth consent screen:**
   - User type: **External**.
   - Fill in app name, your support email, developer email.
   - **Scopes:** add these three (Classroom, student/read-only):
     ```
     .../auth/classroom.courses.readonly
     .../auth/classroom.coursework.me.readonly
     .../auth/classroom.student-submissions.me.readonly
     ```
   - **Test users:** add your own Google address (e.g. your `@student.…` school account).
     While the app is in **Testing** mode, only listed test users can sign in — which is
     perfect for personal/club use. (To open it to a whole school you'd submit the app
     for Google verification, or have your Workspace admin allowlist it.)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID:**
   - Application type: **Web application**.
   - **Authorized redirect URIs:** add your Supabase auth callback:
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```
     (Find the exact value in Supabase → Authentication → Providers → Google.)
   - Create, then copy the **Client ID** and **Client secret**.

---

## 3. Connect Google to Supabase + set env vars

1. In Supabase: **Authentication → Providers → Google → Enable**, then paste the
   **Client ID** and **Client secret** from step 2. Save.
2. In the project root, copy the env template and fill in the two Supabase values:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   # optional — or set it later in the app under Settings → API Keys
   VITE_GEMINI_API_KEY=
   ```

That's it. Now run it.

---

## Run locally

```bash
npm install
cd client && npm run dev      # http://localhost:5173
```

You do **not** need the Express server for the core app. (It only exists for optional
self-hosting / legacy endpoints.)

1. Open <http://localhost:5173>, click **Continue with Google**, sign in.
2. Go to **Settings → Integrations** (or the **Sync Classroom** button on Assignments /
   Home) and import your courses, assignments, and grades.

## Deploy to Vercel

1. Import the repo into Vercel. The build settings come from `vercel.json` (builds the
   client, serves `client/dist`, SPA routing).
2. Add the env vars in **Vercel → Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional)
3. Add your Vercel URL to **both**:
   - Supabase → Authentication → URL Configuration → Redirect URLs (`https://…/auth/callback`)
   - (Google's redirect URI stays the Supabase callback — no change needed.)

---

## How Google Classroom sync works (so you know what to expect)

- Signing in with Google grants a short-lived Google access token (~1 hour) carrying the
  three read-only Classroom scopes. The browser calls the Classroom API directly with it.
- **Sync** pulls your active courses → their coursework → *your own* submissions (for status
  and grades), and merges them in. It's **idempotent**: re-syncing updates items in place and
  never creates duplicates. Anything you mark done by hand stays done.
- If the token has expired, the app will ask you to reconnect (one click). Imported
  assignments link back to Classroom and your grades feed into the GPA on the dashboard.
- It's **read-only** — Shiori never changes anything in your Google Classroom.

## Troubleshooting

- **"Google sign-in requires Supabase to be configured"** → `.env` is missing/empty, or you
  didn't restart `npm run dev` after editing it.
- **Redirects to login after Google** → the redirect URL isn't in Supabase → Auth → URL
  Configuration, or the Google provider isn't enabled in Supabase.
- **`access_denied` / `app isn't verified`** → add your Google account under OAuth consent
  screen → Test users (Testing mode).
- **Sync says session expired** → click reconnect; tokens last ~1 hour.
- **No courses imported** → make sure you're a *student* in active Classroom courses with that
  same Google account.
