#!/bin/bash
# Run this once to set GitHub repo topics and description for maximum discoverability
# Usage: bash scripts/setup-github.sh <your-github-token>
# Get token: https://github.com/settings/tokens (needs repo scope)

TOKEN=${1:-$GITHUB_TOKEN}
OWNER="kaorii-ako"
REPO="Shiori-v1"

if [ -z "$TOKEN" ]; then
  echo "Usage: bash scripts/setup-github.sh YOUR_GITHUB_TOKEN"
  echo "Get a token at: https://github.com/settings/tokens (repo scope)"
  exit 1
fi

echo "Setting GitHub repo topics..."
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/$OWNER/$REPO/topics \
  -d '{"names":["react","education","ai","gemini","student","productivity","google-classroom","supabase","pwa","open-source","study-planner","flashcards","gpa-calculator","pomodoro","spaced-repetition","docker","self-hosted","mcp-server","typescript","vite"]}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Topics set:', d.get('names', d))"

echo ""
echo "Setting repo description..."
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/$OWNER/$REPO \
  -d '{"description":"🎓 Free AI study companion — Google Classroom sync, GPA calculator, SRS flashcards, AI study plans, Pomodoro. Self-hostable with Docker. MCP server for Claude Code.","homepage":"https://shiori-v1.vercel.app","has_wiki":true,"has_issues":true}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Updated:', d.get('full_name', 'error'))"

echo ""
echo "Done! Check your repo at: https://github.com/$OWNER/$REPO"
