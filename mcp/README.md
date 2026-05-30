# Shiori MCP Server

Use your Shiori study data directly inside **Claude Code**, **Claude Desktop**, and any MCP-compatible client.

```
"What's due this week?"
"Show me my grades"
"Add: Physics lab report due Friday"
"Summarize my Calculus notes"
```

## Tools

| Tool | What it does |
|------|-------------|
| `get_study_summary` | Full academic status — assignments, GPA, overdue items |
| `get_assignments` | List assignments, filter by status/course/days |
| `get_grades` | GPA and per-course breakdown |
| `get_notes` | List and read course notes |
| `add_assignment` | Add an assignment from Claude |
| `get_flashcard_decks` | List decks and cards due for review |
| `predict_grade` | "What score do I need on the final to get an A?" — calculates required score on remaining work |
| `get_study_plan` | Auto-prioritized study plan for the next N days based on deadlines + estimated hours |

## Setup (2 min)

### 1. Export your data from Shiori

Open the Shiori app → **Settings → Export Data** → save as `shiori-data.json`

### 2. Install dependencies

```bash
cd mcp
npm install
```

### 3. Add to Claude Code (`~/.claude.json`)

```json
{
  "mcpServers": {
    "shiori": {
      "command": "node",
      "args": ["/absolute/path/to/Shiori-v1/mcp/index.js"],
      "env": {
        "SHIORI_DATA_FILE": "/absolute/path/to/shiori-data.json"
      }
    }
  }
}
```

### 4. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or  
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "shiori": {
      "command": "node",
      "args": ["C:/path/to/Shiori-v1/mcp/index.js"],
      "env": {
        "SHIORI_DATA_FILE": "C:/path/to/shiori-data.json"
      }
    }
  }
}
```

### 5. Restart Claude — done

Claude now has `shiori_*` tools. Try: **"What's my study status today?"**

## Example prompts

```
What assignments do I have due this week?
What score do I need on the Physics final to keep my B+?
Show me my Data Structures notes
Add an assignment: "Essay draft" for English, due next Monday
Which flashcard decks have cards due for review?
```

## Data stays local

Your `shiori-data.json` never leaves your machine. The MCP server reads the file locally — no network requests.
