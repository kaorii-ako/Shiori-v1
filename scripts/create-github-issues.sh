#!/usr/bin/env bash
# Usage: GITHUB_TOKEN=your_pat bash scripts/create-github-issues.sh
# Get a token: github.com/settings/tokens → New classic token → check "repo" scope

OWNER="kaorii-ako"
REPO="Shiori-v1"
API="https://api.github.com/repos/$OWNER/$REPO/issues"
AUTH="Authorization: token $GITHUB_TOKEN"

create() {
  local title="$1"
  local labels="$2"
  local body="$3"
  curl -s -X POST "$API" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"title\": $(echo "$title" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'), \"labels\": $labels, \"body\": $(echo "$body" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')}" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅', d.get('number','?'), d.get('title','ERR')[:60])"
}

echo "Creating good-first-issue tickets for Shiori..."

create \
  "feat: confetti animation when all assignments are marked complete" \
  '["good first issue","enhancement","fun"]' \
  "## Summary\n\nWhen the last pending assignment is marked done, fire a confetti burst.\n\n## How\n\nUse \`canvas-confetti\` (already installed):\n\n\`\`\`js\nimport confetti from 'canvas-confetti'\nif (remaining === 0) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })\n\`\`\`\n\n## Files\n- \`client/src/pages/Assignments.jsx\`\n\n**Difficulty:** Very easy — 5 lines"

create \
  "feat: PWA install prompt banner for mobile users" \
  '["good first issue","enhancement"]' \
  "## Summary\n\nShow a dismissible bottom banner on mobile: 'Install Shiori — study anywhere, offline.'\n\n## Details\n- Listen for \`beforeinstallprompt\`, store it\n- Banner: tap → \`deferredPrompt.prompt()\`\n- Dismiss state in localStorage\n\n## Files\n- \`client/src/components/InstallBanner.jsx\` (new)\n- \`client/src/components/Layout.jsx\`\n\n**Difficulty:** Easy"

create \
  "feat: export flashcards to Anki tab-separated format (.txt import)" \
  '["enhancement","help wanted"]' \
  "## Summary\n\nLet users export flashcard decks as tab-separated .txt files importable into Anki.\n\n## Format\n\`\`\`\nFront\tBack\nWhat is X?\tAnswer\n\`\`\`\nAnki: File → Import → select file.\n\n## Files\n- \`client/src/pages/Flashcards.jsx\` — add 'Export to Anki' button\n\n**Difficulty:** Easy"

create \
  "feat: streak freeze / grace day for habit tracker" \
  '["good first issue","enhancement"]' \
  "## Summary\n\nAdd a 'streak freeze' — 1 grace day per week that protects your streak.\n\n## Details\n- Track \`freezesAvailable\` in habits localStorage\n- Show: 🧊 1 freeze left in HabitCard\n- If user misses a day + has freeze: apply it, show toast 'Streak saved!'\n- Earn 1 freeze for 5+ habits completed in a week\n\n**Difficulty:** Medium"

create \
  "feat: add 'copy note content' button to Notes page" \
  '["good first issue","enhancement"]' \
  "## Summary\n\nOne-click copy of the entire note's markdown content to clipboard.\n\n## Details\n- Add clipboard icon button next to Download in the note editor toolbar\n- \`navigator.clipboard.writeText(note.content)\`\n- Show 'Copied!' toast for 1.5s\n\n## Files\n- \`client/src/pages/Notes.jsx\`\n\n**Difficulty:** Very easy — 10 lines"

create \
  "feat: word count display in Notes editor" \
  '["good first issue","ui"]' \
  "## Summary\n\nShow live word count and estimated read time in the Notes editor toolbar.\n\n## Details\n- \`words = content.trim().split(/\s+/).filter(Boolean).length\`\n- \`readTime = Math.ceil(words / 200)\` minutes\n- Display: '142 words · 1 min read' in muted text below toolbar\n\n**Difficulty:** Very easy"

create \
  "feat: progress ring animation for Pomodoro timer" \
  '["enhancement","ui"]' \
  "## Summary\n\nReplace the plain text countdown with an SVG circular progress ring.\n\n## Details\n- SVG circle, \`stroke-dasharray\` / \`stroke-dashoffset\` technique\n- Ring depletes from full → empty as the timer counts down\n- Keep the digital time display in the center\n\n## Files\n- \`client/src/components/PomodoroTimer.jsx\`\n\n**Difficulty:** Medium"

create \
  "feat: drag-and-drop reorder for study plan tasks" \
  '["enhancement","help wanted"]' \
  "## Summary\n\nAllow drag-and-drop reordering of tasks in the AI-generated study plan.\n\n## Details\nUse \`@dnd-kit/sortable\` (lightweight, accessible):\n- Wrap task list in \`SortableContext\`\n- Each task becomes a \`SortableItem\`\n- On drag end → reorder the tasks array in store\n\n**Difficulty:** Medium"

create \
  "feat: flashcard search/filter within a deck" \
  '["good first issue","enhancement"]' \
  "## Summary\n\nAdd a search box above the flashcard list to filter cards by front or back content.\n\n## Details\n- Controlled input at the top of the deck view\n- Filter cards array: \`cards.filter(c => c.front.includes(q) || c.back.includes(q))\`\n- Show 'X cards match' count\n\n**Difficulty:** Very easy"

create \
  "feat: import notes from .md or .txt files" \
  '["enhancement","help wanted"]' \
  "## Summary\n\nAllow users to import existing markdown or plain text files as notes.\n\n## Details\n- Add an 'Import .md' button in the Notes sidebar\n- Use \`<input type='file' accept='.md,.txt'>\`\n- Read with FileReader, create a new note with the content\n\n**Difficulty:** Easy"

echo ""
echo "Done! Check github.com/$OWNER/$REPO/issues"
