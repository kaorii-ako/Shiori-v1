#!/usr/bin/env node
/**
 * Shiori MCP Server
 * Exposes your Shiori study data to Claude Code, Claude Desktop, and any MCP client.
 *
 * Setup:
 *   1. cd mcp && npm install
 *   2. Add to ~/.claude.json (Claude Code) or claude_desktop_config.json:
 *
 *   "shiori": {
 *     "command": "node",
 *     "args": ["/absolute/path/to/Shiori-v1/mcp/index.js"],
 *     "env": { "SHIORI_DATA_FILE": "/path/to/shiori-data.json" }
 *   }
 *
 *   3. Export your data from Shiori: Settings → Export Data
 *   4. Set SHIORI_DATA_FILE to the exported JSON path
 *
 * Or run against a live Shiori server:
 *   SHIORI_URL=http://localhost:3001 node index.js
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const DATA_FILE = process.env.SHIORI_DATA_FILE || null
const SHIORI_URL = process.env.SHIORI_URL || null

function loadData() {
  if (DATA_FILE && fs.existsSync(DATA_FILE)) {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch { return {} }
  }
  return {}
}

function saveData(data) {
  if (DATA_FILE) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  }
}

const server = new McpServer({
  name: 'shiori',
  version: '1.0.0',
  description: 'Access and manage your Shiori study data — assignments, grades, notes, and flashcards.',
})

// ─── Tools ────────────────────────────────────────────────────────────────────

server.tool(
  'get_assignments',
  'List your upcoming assignments. Optionally filter by course or status.',
  {
    status: z.enum(['all', 'pending', 'completed', 'graded']).default('all').describe('Filter by status'),
    days: z.number().min(1).max(365).default(7).describe('Only show assignments due within this many days'),
    course: z.string().optional().describe('Filter by course name (partial match)'),
  },
  async ({ status, days, course }) => {
    const data = loadData()
    const assignments = data.assignments || []
    const now = new Date()
    const cutoff = new Date(now.getTime() + days * 86400000)

    let filtered = assignments.filter(a => {
      if (status !== 'all' && a.status !== status) return false
      if (a.dueDate && new Date(a.dueDate) > cutoff) return false
      if (course) {
        const courseName = (data.courses || []).find(c => c.id === a.courseId)?.name || ''
        if (!courseName.toLowerCase().includes(course.toLowerCase())) return false
      }
      return true
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    if (filtered.length === 0) return { content: [{ type: 'text', text: 'No assignments found matching your criteria.' }] }

    const lines = filtered.map(a => {
      const course = (data.courses || []).find(c => c.id === a.courseId)?.name || 'Unknown'
      const due = a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'No due date'
      const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate) - now) / 86400000) : null
      const urgency = daysLeft !== null ? (daysLeft <= 0 ? ' ⚠️ OVERDUE' : daysLeft <= 2 ? ` (${daysLeft}d left!)` : ` (${daysLeft}d)`) : ''
      return `• [${a.status?.toUpperCase() || 'PENDING'}] ${a.title} — ${course} — Due: ${due}${urgency}`
    })

    return { content: [{ type: 'text', text: `Found ${filtered.length} assignment(s):\n\n${lines.join('\n')}` }] }
  }
)

server.tool(
  'get_grades',
  'Show your current GPA and grades per course.',
  {},
  async () => {
    const data = loadData()
    const courses = data.courses || []
    const courseGrades = data.courseGrades || {}

    if (courses.length === 0) return { content: [{ type: 'text', text: 'No courses or grades found. Export your data from Shiori Settings.' }] }

    let totalPts = 0, totalPoss = 0
    const lines = []

    for (const course of courses) {
      const grades = courseGrades[course.id]
      if (!grades) continue
      let pts = 0, poss = 0
      const entries = []
      for (const [, g] of Object.entries(grades)) {
        pts += g.pointsEarned || 0
        poss += g.pointsPossible || 0
        entries.push(`  - ${g.name}: ${g.pointsEarned}/${g.pointsPossible}`)
      }
      if (poss > 0) {
        totalPts += pts; totalPoss += poss
        const pct = ((pts / poss) * 100).toFixed(1)
        const letter = pct >= 93 ? 'A' : pct >= 90 ? 'A-' : pct >= 87 ? 'B+' : pct >= 83 ? 'B' : pct >= 80 ? 'B-' : pct >= 77 ? 'C+' : pct >= 73 ? 'C' : 'D/F'
        lines.push(`**${course.name}**: ${pct}% (${letter})`)
        lines.push(...entries)
      }
    }

    const overall = totalPoss > 0 ? ((totalPts / totalPoss) * 100).toFixed(1) : null
    const header = overall ? `Overall GPA: ${overall}%\n\n` : ''
    return { content: [{ type: 'text', text: `${header}${lines.join('\n') || 'No grades recorded yet.'}` }] }
  }
)

server.tool(
  'get_notes',
  'List and read your course notes.',
  {
    course: z.string().optional().describe('Filter by course name'),
    content: z.boolean().default(false).describe('Include full note content (not just titles)'),
  },
  async ({ course, content }) => {
    const data = loadData()
    const notes = data.notes || []
    let filtered = notes
    if (course) {
      const courses = data.courses || []
      filtered = notes.filter(n => {
        const courseName = courses.find(c => c.id === n.courseId)?.name || ''
        return courseName.toLowerCase().includes(course.toLowerCase())
      })
    }
    if (filtered.length === 0) return { content: [{ type: 'text', text: 'No notes found.' }] }

    const lines = filtered.map(n => {
      const courseName = (data.courses || []).find(c => c.id === n.courseId)?.name || ''
      const preview = content ? `\n${n.content}\n` : ` — ${n.content?.slice(0, 80).replace(/\n/g, ' ')}…`
      return `📝 **${n.title || 'Untitled'}** [${courseName}]${preview}`
    })

    return { content: [{ type: 'text', text: lines.join('\n\n') }] }
  }
)

server.tool(
  'add_assignment',
  'Add a new assignment to Shiori.',
  {
    title: z.string().describe('Assignment title'),
    dueDate: z.string().describe('Due date in YYYY-MM-DD format'),
    course: z.string().optional().describe('Course name (partial match OK)'),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    description: z.string().optional(),
  },
  async ({ title, dueDate, course, priority, description }) => {
    const data = loadData()
    data.assignments = data.assignments || []
    data.courses = data.courses || []

    let courseId = null
    if (course) {
      const found = data.courses.find(c => c.name.toLowerCase().includes(course.toLowerCase()))
      courseId = found?.id || null
    }

    const newAssignment = {
      id: `mcp-${Date.now()}`,
      title,
      dueDate,
      courseId,
      priority,
      description: description || '',
      status: 'pending',
      createdAt: Date.now(),
      source: 'mcp',
    }
    data.assignments.push(newAssignment)
    saveData(data)

    return { content: [{ type: 'text', text: `✅ Added: "${title}" due ${dueDate}${courseId ? ` for ${(data.courses.find(c => c.id === courseId))?.name}` : ''}` }] }
  }
)

server.tool(
  'get_study_summary',
  'Get a full summary of your current academic status — assignments, grades, habits, and upcoming events.',
  {},
  async () => {
    const data = loadData()
    const now = new Date()
    const assignments = data.assignments || []

    const pending = assignments.filter(a => a.status === 'pending' && a.dueDate && new Date(a.dueDate) >= now)
    const overdue = assignments.filter(a => a.status === 'pending' && a.dueDate && new Date(a.dueDate) < now)
    const thisWeek = pending.filter(a => new Date(a.dueDate) <= new Date(now.getTime() + 7 * 86400000))

    const courseGrades = data.courseGrades || {}
    let totalPts = 0, totalPoss = 0
    for (const cg of Object.values(courseGrades)) {
      for (const g of Object.values(cg)) {
        totalPts += g.pointsEarned || 0
        totalPoss += g.pointsPossible || 0
      }
    }
    const gpa = totalPoss > 0 ? ((totalPts / totalPoss) * 100).toFixed(1) : null

    const lines = [
      `📊 **SHIORI STUDY SUMMARY** — ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      '',
      `📋 Assignments: ${pending.length} pending, ${overdue.length} overdue, ${thisWeek.length} due this week`,
      gpa ? `🎓 Overall GPA: ${gpa}%` : '🎓 GPA: Not yet tracked',
      `📝 Notes: ${(data.notes || []).length} notes`,
      `🃏 Flashcard decks: ${(data.flashcardDecks || []).length}`,
      '',
    ]

    if (overdue.length > 0) {
      lines.push(`⚠️ OVERDUE (${overdue.length}):`)
      overdue.slice(0, 3).forEach(a => {
        const course = (data.courses || []).find(c => c.id === a.courseId)?.name || ''
        lines.push(`  • ${a.title} [${course}] — was due ${new Date(a.dueDate).toLocaleDateString()}`)
      })
      lines.push('')
    }

    if (thisWeek.length > 0) {
      lines.push(`📅 DUE THIS WEEK (${thisWeek.length}):`)
      thisWeek.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).forEach(a => {
        const course = (data.courses || []).find(c => c.id === a.courseId)?.name || ''
        const daysLeft = Math.ceil((new Date(a.dueDate) - now) / 86400000)
        lines.push(`  • ${a.title} [${course}] — ${daysLeft === 0 ? 'TODAY' : daysLeft === 1 ? 'Tomorrow' : `in ${daysLeft}d`}`)
      })
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] }
  }
)

server.tool(
  'get_flashcard_decks',
  'List your flashcard decks and review status.',
  {},
  async () => {
    const data = loadData()
    const decks = data.flashcardDecks || []
    if (decks.length === 0) return { content: [{ type: 'text', text: 'No flashcard decks found.' }] }

    const now = Date.now()
    const lines = decks.map(deck => {
      const cards = deck.cards || []
      const dueNow = cards.filter(c => !c.nextReview || c.nextReview <= now).length
      const course = (data.courses || []).find(c => c.id === deck.courseId)?.name || 'General'
      return `🃏 **${deck.name}** [${course}] — ${cards.length} cards, ${dueNow} due for review`
    })

    return { content: [{ type: 'text', text: lines.join('\n') }] }
  }
)

// ─── Resources ────────────────────────────────────────────────────────────────

server.resource(
  'shiori://assignments',
  'All assignments as JSON',
  async () => {
    const data = loadData()
    return { contents: [{ uri: 'shiori://assignments', mimeType: 'application/json', text: JSON.stringify(data.assignments || [], null, 2) }] }
  }
)

server.resource(
  'shiori://grades',
  'All grades as JSON',
  async () => {
    const data = loadData()
    return { contents: [{ uri: 'shiori://grades', mimeType: 'application/json', text: JSON.stringify(data.courseGrades || {}, null, 2) }] }
  }
)

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)
