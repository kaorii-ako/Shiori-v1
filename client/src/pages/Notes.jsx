import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, Plus, Trash2, Download, Search, Pin, PinOff,
  FileText, Layers, Sparkles, Copy, Check as CheckIcon, Bold,
  Italic, Code, Heading1, Heading2, List,
} from 'lucide-react'
import { useNotesStore, useAssignmentsStore, useFlashcardsStore } from '../stores'
import { ai } from '../lib/api'
import { callGeminiClient } from '../utils/gemini'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  surfaceBright: 'rgba(20,25,34,0.9)',
  border: 'rgba(50,55,70,0.4)',
  borderBright: 'rgba(80,90,110,0.5)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
  cyan: '#4daaff',
}

const NOTE_COLORS = [
  '#ff6b9d', '#c44dff', '#afc6ff', '#4dff91',
  '#ffd6a0', '#4daaff', '#ff8f6b', '#e5b5ff',
]

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const renderMarkdown = (text) => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;font-family:monospace">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;color:#afc6ff;margin:14px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:700;color:#e5b5ff;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:\'Space Grotesk\',sans-serif;font-size:18px;font-weight:700;color:#c44dff;margin:18px 0 10px">$1</h1>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;padding-left:4px;list-style:decimal">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#afc6ff;text-decoration:underline">$1</a>')
    .replace(/\n/g, '<br/>')
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${T.border}`,
  color: T.text,
  outline: 'none',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  boxSizing: 'border-box',
}

const NoteListItem = ({ note, isSelected, onClick, onDelete, onPin, courses }) => {
  const course = courses?.find(c => c.id === note.courseId)
  return (
    <motion.div
      whileHover={{ y: -1 }}
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        background: isSelected ? 'rgba(196,77,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: isSelected ? `1px solid rgba(196,77,255,0.35)` : `1px solid ${T.border}`,
        transition: 'background 0.15s, border-color 0.15s',
        position: 'relative',
      }}
    >
      {note.pinned && (
        <Pin size={10} style={{ position: 'absolute', top: 10, right: 10, color: T.orange, opacity: 0.8 }} />
      )}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: T.text,
        marginBottom: 3,
        paddingRight: 16,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {note.title || 'Untitled'}
      </div>
      <div style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: 11,
        color: T.muted,
        marginBottom: 4,
      }}>
        {course?.name || 'No course'}
      </div>
      <div style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: 10,
        color: T.faint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
      }}>
        <span>{timeAgo(note.updatedAt)}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={e => { e.stopPropagation(); onPin(note.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.faint, display: 'flex' }}
          >
            {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(note.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.pink, display: 'flex', opacity: 0.6 }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const Notes = () => {
  const { notes, addNote, updateNote, deleteNote, pinNote } = useNotesStore()
  const { courses } = useAssignmentsStore()
  const { addDeck, loadDeck } = useFlashcardsStore()

  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(true)
  const [generatingCards, setGeneratingCards] = useState(false)
  const [genSuccess, setGenSuccess] = useState(null)
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState(null)
  const [copied, setCopied] = useState(false)
  const saveTimer = useRef(null)
  const importFileRef = useRef(null)
  const textareaRef = useRef(null)

  const selected = notes.find(n => n.id === selectedId)

  const filtered = notes
    .filter(n => {
      if (filterCourse !== 'all' && n.courseId !== filterCourse) return false
      if (search) {
        const q = search.toLowerCase()
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.updatedAt - a.updatedAt
    })

  const handleNew = () => {
    const id = addNote({
      title: '',
      content: '',
      courseId: filterCourse !== 'all' ? filterCourse : null,
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
      pinned: false,
    })
    setSelectedId(id)
    setSaved(true)
  }

  const handleUpdate = (field, val) => {
    if (!selectedId) return
    setSaved(false)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(selectedId, { [field]: val })
      setSaved(true)
    }, 600)
    updateNote(selectedId, { [field]: val })
  }

  const handleExport = () => {
    if (!selected) return
    const text = `# ${selected.title || 'Untitled'}\n\n${selected.content}`
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shiori-note-${(selected.title || 'untitled').replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateFlashcards = async () => {
    if (!selected || !selected.content.trim() || generatingCards) return
    setGeneratingCards(true)
    setGenSuccess(null)
    try {
      const res = await ai.generateFlashcards(selected.content, selected.title)
      const cards = res.data?.cards || []
      if (cards.length === 0) throw new Error('No cards generated')
      const deckId = `deck-${Date.now()}`
      loadDeck({
        id: deckId,
        name: selected.title || 'Note Flashcards',
        courseId: selected.courseId || null,
        createdAt: Date.now(),
        cards: cards.map((c, i) => ({
          id: `card-${deckId}-${i}`,
          front: c.front,
          back: c.back,
          streak: 0,
          nextReview: null,
        })),
      })
      setGenSuccess(cards.length)
    } catch {
      const lines = selected.content.split('\n')
      const cards = []
      let lastHeading = null
      lines.forEach(line => {
        if (/^#{1,3}\s/.test(line)) lastHeading = line.replace(/^#{1,3}\s/, '').trim()
        else if (/^[-*]\s/.test(line) && lastHeading) {
          const pt = line.replace(/^[-*]\s/, '').trim()
          if (pt.length > 6) cards.push({ front: `What is "${lastHeading}"?`, back: pt })
        }
      })
      if (cards.length > 0) {
        const deckId = `deck-${Date.now()}`
        loadDeck({
          id: deckId,
          name: selected.title || 'Note Flashcards',
          courseId: selected.courseId || null,
          createdAt: Date.now(),
          cards: cards.slice(0, 10).map((c, i) => ({
            id: `card-${deckId}-${i}`, front: c.front, back: c.back, streak: 0, nextReview: null,
          })),
        })
        setGenSuccess(cards.length)
      } else {
        setGenSuccess(0)
      }
    } finally {
      setGeneratingCards(false)
      setTimeout(() => setGenSuccess(null), 4000)
    }
  }

  const handleSummarize = async () => {
    if (!selected?.content.trim() || summarizing) return
    setSummarizing(true)
    setSummary(null)
    const prompt = `Summarize the following study notes into 5-7 concise bullet points. Each bullet must be one sentence. Focus on key concepts and facts a student needs to remember.

Notes:
${selected.content.slice(0, 3000)}

Return ONLY the bullet points, one per line, each starting with "• ". No intro, no outro.`
    const result = await callGeminiClient(prompt)
    setSummarizing(false)
    setSummary(result || 'Could not generate summary. Check your Gemini API key in Settings.')
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result || ''
      const title = file.name.replace(/\.(md|txt)$/i, '')
      const id = addNote({ title, content, courseId: null, color: NOTE_COLORS[notes.length % NOTE_COLORS.length], pinned: false })
      setSelectedId(id)
      setSaved(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCopy = () => {
    if (!selected?.content) return
    navigator.clipboard.writeText(selected.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const insertMarkdown = (wrap) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = ta.value.slice(start, end)
    const newVal = ta.value.slice(0, start) + wrap + sel + wrap + ta.value.slice(end)
    handleUpdate('content', newVal)
  }

  const insertLinePrefix = (prefix) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1
    const newVal = ta.value.slice(0, lineStart) + prefix + ' ' + ta.value.slice(lineStart)
    handleUpdate('content', newVal)
  }

  const wordCount = selected?.content
    ? selected.content.trim().split(/\s+/).filter(Boolean).length
    : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id)
  }, [])

  const uniqueCourses = courses.filter(c => notes.some(n => n.courseId === c.id))

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, gap: 0, overflow: 'hidden' }}>
      {/* Left sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '20px 14px',
          background: 'rgba(10,13,18,0.8)',
          borderRight: `1px solid ${T.border}`,
          overflowY: 'auto',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.faint }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{ ...inputStyle, paddingLeft: 32, fontSize: 13 }}
          />
        </div>

        {/* New Note button */}
        <button
          onClick={handleNew}
          style={{
            padding: '9px 20px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #c44dff, #528dff)',
            color: '#fff',
            border: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Plus size={14} /> New Note
        </button>

        {/* Course filter pills */}
        {uniqueCourses.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              onClick={() => setFilterCourse('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                border: filterCourse === 'all' ? '1px solid rgba(196,77,255,0.5)' : `1px solid ${T.border}`,
                background: filterCourse === 'all' ? 'rgba(196,77,255,0.12)' : 'rgba(255,255,255,0.03)',
                color: filterCourse === 'all' ? T.purpleVibrant : T.muted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {uniqueCourses.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCourse(c.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: filterCourse === c.id ? '1px solid rgba(196,77,255,0.5)' : `1px solid ${T.border}`,
                  background: filterCourse === c.id ? 'rgba(196,77,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: filterCourse === c.id ? T.purpleVibrant : T.muted,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Note list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((note, idx) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <NoteListItem
                    note={note}
                    isSelected={selectedId === note.id}
                    courses={courses}
                    onClick={() => setSelectedId(note.id)}
                    onDelete={(id) => {
                      deleteNote(id)
                      if (selectedId === id) setSelectedId(filtered.find(n => n.id !== id)?.id || null)
                    }}
                    onPin={pinNote}
                  />
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: T.faint }}>
                <StickyNote size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13 }}>
                  {search ? 'No notes match' : 'No notes yet'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Import */}
        <input ref={importFileRef} type="file" accept=".md,.txt" style={{ display: 'none' }} onChange={handleImportFile} />
        <button
          onClick={() => importFileRef.current?.click()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${T.border}`,
            color: T.muted,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <FileText size={13} /> Import .md / .txt
        </button>
      </motion.div>

      {/* Main editor panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}
      >
        {selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', gap: 0, overflow: 'hidden', position: 'relative' }}>
            {/* Title */}
            <input
              value={selected.title}
              onChange={e => handleUpdate('title', e.target.value)}
              placeholder="Note title..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${T.border}`,
                outline: 'none',
                color: T.text,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 24,
                padding: '0 0 12px 0',
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />

            {/* Course selector + word count row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <select
                value={selected.courseId || ''}
                onChange={e => handleUpdate('courseId', e.target.value || null)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${T.border}`,
                  color: T.muted,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">No course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint }}>
                {wordCount} words · {readTime} min read
              </span>
            </div>

            {/* Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              background: T.surfaceBright,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}>
              {/* Format buttons */}
              {[
                { icon: Bold, title: 'Bold', action: () => insertMarkdown('**') },
                { icon: Italic, title: 'Italic', action: () => insertMarkdown('*') },
                { icon: Code, title: 'Code', action: () => insertMarkdown('`') },
                { icon: Heading1, title: 'H1', action: () => insertLinePrefix('#') },
                { icon: Heading2, title: 'H2', action: () => insertLinePrefix('##') },
                { icon: List, title: 'List', action: () => insertLinePrefix('-') },
              ].map(({ icon: Icon, title, action }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${T.border}`,
                    color: T.muted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={13} />
                </button>
              ))}

              <div style={{ width: 1, height: 20, background: T.border, margin: '0 4px' }} />

              {/* AI Summarize */}
              <button
                onClick={handleSummarize}
                disabled={summarizing || !selected?.content?.trim()}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(175,198,255,0.08)',
                  border: '1px solid rgba(175,198,255,0.25)',
                  color: T.blue,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  opacity: (!selected?.content?.trim() || summarizing) ? 0.5 : 1,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                }}
              >
                <Sparkles size={12} />
                {summarizing ? 'Thinking…' : 'AI Summarize'}
              </button>

              {/* AI Flashcards */}
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingCards || !selected?.content?.trim()}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(77,255,145,0.07)',
                  border: `1px solid ${genSuccess !== null ? (genSuccess > 0 ? 'rgba(77,255,145,0.5)' : 'rgba(255,77,106,0.4)') : 'rgba(77,255,145,0.2)'}`,
                  color: T.green,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  opacity: (!selected?.content?.trim() || generatingCards) ? 0.5 : 1,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                }}
              >
                <Layers size={12} />
                {generatingCards ? 'Generating…' : genSuccess !== null ? (genSuccess > 0 ? `✓ ${genSuccess} cards` : 'No content') : 'AI Flashcards'}
              </button>

              <div style={{ flex: 1 }} />

              {/* Copy */}
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: copied ? 'rgba(77,255,145,0.10)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${copied ? 'rgba(77,255,145,0.35)' : T.border}`,
                  color: copied ? T.green : T.muted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                }}
              >
                {copied ? <CheckIcon size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              {/* Export .md */}
              <button
                onClick={handleExport}
                title="Export as Markdown"
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${T.border}`,
                  color: T.muted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                }}
              >
                <Download size={12} /> Export .md
              </button>

              {/* Preview toggle */}
              <button
                onClick={() => setPreview(p => !p)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: preview ? 'rgba(196,77,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${preview ? 'rgba(196,77,255,0.4)' : T.border}`,
                  color: preview ? T.purpleVibrant : T.muted,
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                }}
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>

            {/* Editor / Preview */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
              {preview ? (
                <div
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: '#c8ccd8',
                    padding: '4px 2px',
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={selected.content}
                  onChange={e => handleUpdate('content', e.target.value)}
                  placeholder={'Start writing...\n\nMarkdown supported:\n**bold**, *italic*, `code`\n# Heading 1\n## Heading 2\n- bullet list'}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    background: 'transparent',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    color: '#c8ccd8',
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontSize: 13,
                    lineHeight: 1.8,
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            {/* Markdown hint row */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 8, borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
              {['**bold**', '*italic*', '`code`', '# h1', '## h2', '- list'].map(md => (
                <span key={md} style={{ fontFamily: 'monospace', fontSize: 11, color: T.faint }}>{md}</span>
              ))}
            </div>

            {/* AI Summary panel */}
            <AnimatePresence>
              {summary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginTop: 14 }}
                >
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(175,198,255,0.07)',
                    border: '1px solid rgba(175,198,255,0.20)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: T.blue, letterSpacing: '0.08em' }}>
                        ✦ AI SUMMARY
                      </span>
                      <button
                        onClick={() => setSummary(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.faint, fontSize: 16, lineHeight: 1 }}
                      >×</button>
                    </div>
                    {summary.split('\n').filter(l => l.trim()).map((line, i, arr) => (
                      <div key={i} style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 13,
                        color: '#c4c8d4',
                        lineHeight: 1.65,
                        padding: '3px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}>{line}</div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-save indicator */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              right: 24,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.06em',
              color: saved ? T.green : T.orange,
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              pointerEvents: 'none',
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: saved ? T.green : T.orange,
                display: 'inline-block',
              }} />
              {saved ? 'Saved' : 'Saving…'}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: 40,
          }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: T.muted,
                marginBottom: 8,
              }}>
                Select a note or create one
              </p>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, marginBottom: 20 }}>
                Your markdown notes live here
              </p>
              <button
                onClick={handleNew}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #c44dff, #528dff)',
                  color: '#fff',
                  border: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} /> New Note
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Notes
