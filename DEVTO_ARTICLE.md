---
title: I built an MCP server that lets Claude read my study data — here's how
published: true
description: Shiori is an open-source AI study companion. I added an MCP server so Claude Code and Claude Desktop can read your assignments, grades, and flashcards directly in context.
tags: mcp, opensource, ai, education
cover_image: https://shiori-v1.vercel.app/og-image.png
---

# I built an MCP server that lets Claude read my study data

**tl;dr** — Shiori is an open-source AI study app (React + Gemini). I added a Model Context Protocol server so you can ask Claude Code things like "what assignments are due this week?" and get real answers from your actual data.

## The problem

I was using Claude Code to help me study, but it had no idea what I was actually studying. I'd have to paste my notes, deadlines, and grades into the chat every time.

What I wanted: Claude to already *know* my study context.

## What Shiori does

Shiori is a full study companion: assignments, grades, GPA predictor, AI flashcard generation, spaced repetition, AI quiz generator, habit tracker, focus mode (Pomodoro), leaderboard, and a syllabus importer that extracts all assignments from a PDF/text dump.

It runs entirely in the browser — no server needed for the core features. Data lives in localStorage. You can try it at **[shiori-v1.vercel.app](https://shiori-v1.vercel.app)** (click TRY DEMO, no account needed).

## The MCP server

The interesting part: I added a `/mcp` server that exposes 6 tools:

```
get_study_summary     → overview of assignments, grades, streaks
get_assignments       → list with due dates, status, priority
get_grades            → GPA, course grades, trend
get_notes             → your markdown notes
add_assignment        → create assignment from Claude
get_flashcard_decks   → deck names + mastery %
```

### How it works

You export your data from Shiori (Settings → Export Data), which writes `shiori-data.json`. The MCP server reads that file and serves it to Claude.

```js
// mcp/index.js (simplified)
server.tool('get_assignments', async () => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH))
  const upcoming = data.assignments
    .filter(a => !a.completed)
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 20)
  return { content: [{ type: 'text', text: JSON.stringify(upcoming, null, 2) }] }
})
```

### Claude Code setup

Add to `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "shiori": {
      "command": "node",
      "args": ["/path/to/Shiori-v1/mcp/index.js"],
      "env": { "SHIORI_DATA_PATH": "/path/to/shiori-data.json" }
    }
  }
}
```

Then in Claude Code: `what's due this week?` → Claude calls `get_assignments` and gives you a real answer.

### Claude Desktop setup

Same idea, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shiori": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/index.js"]
    }
  }
}
```

## Why this matters

The MCP pattern is powerful for personal tools. Your study data doesn't need to go through any API — it stays local. Claude reads the file directly. This is the "bring your own context" model taken seriously.

I plan to add more tools: `create_study_plan`, `generate_quiz_from_notes`, `get_habit_streaks`.

## Try it

- **Live demo**: [shiori-v1.vercel.app](https://shiori-v1.vercel.app) (no account)
- **GitHub**: [github.com/kaorii-ako/Shiori-v1](https://github.com/kaorii-ako/Shiori-v1)
- **MCP docs**: `mcp/README.md` in the repo

Stars appreciated — this is a solo project and GitHub discoverability matters for open source.

PRs welcome. There are good-first issues open with exact file + line pointers.
