import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StickyNote, Plus, Trash2, BookOpen, Save, Clock,
  Download, Search, Pin, PinOff, Tag, FileText, Layers, Sparkles, Copy, Check as CheckIcon,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useNotesStore, useAssignmentsStore, useFlashcardsStore } from '../stores'
import { ai } from '../lib/api'
import { callGeminiClient, hasClientKey } from '../utils/gemini'

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
    .replace(/^### (.+)$/gm, '<h3 style="font-family:Press Start 2P,monospace;font-size:10px;color:#afc6ff;margin:14px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Press Start 2P,monospace;font-size:12px;color:#e5b5ff;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Press Start 2P,monospace;font-size:14px;color:#c44dff;margin:18px 0 10px">$1</h1>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;padding-left:4px;list-style:decimal">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#afc6ff;text-decoration:underline">$1</a>')
    .replace(/\n/g, '<br/>')
}

const NoteCard = ({ note, isSelected, onClick, onDelete, onPin, courses }) => {
  const course = courses?.find(c => c.id === note.courseId)
  const preview = note.content.replace(/[#*`\n]/g, ' ').slice(0, 80)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ translateY: -1 }}
      onClick={onClick}
      style={{
        padding: '12px 14px', cursor: 'pointer', borderRadius: 8,
        background: isSelected
          ? `rgba(196,77,255,0.12)`
          : note.pinned ? 'rgba(255,214,160,0.05)' : 'rgba(255,255,255,0.03)',
        border: `2px solid ${isSelected
          ? 'rgba(196,77,255,0.5)'
          : note.pinned ? 'rgba(255,214,160,0.25)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {note.pinned && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Pin size={10} color="#ffd6a0" />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        {note.color && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: note.color, flexShrink: 0, marginTop: 6 }} />
        )}
        <span style={{ fontFamily: 'VT323', fontSize: 18, color: '#dfe2eb', lineHeight: 1.2, flex: 1, paddingRight: note.pinned ? 16 : 0 }}>
          {note.title || 'Untitled'}
        </span>
      </div>
      {preview && (
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#606080', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {preview}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {course && (
            <span style={{ fontFamily: 'VT323', fontSize: 13, color: course.color, padding: '1px 6px',
              background: `${course.color}18`, borderRadius: 4 }}>
              {course.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>
            <Clock size={9} style={{ display: 'inline', marginRight: 3 }} />
            {timeAgo(note.updatedAt)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onPin(note.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
          >
            {note.pinned ? <PinOff size={11} color="#ffd6a0" /> : <Pin size={11} color="#8c90a0" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
          >
            <Trash2 size={11} color="#ff4d6a" />
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
  const saveTimer = useRef(null)

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
      // Fallback: create deck from note headings manually
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

  const [copied, setCopied] = useState(false)
  const wordCount = selected?.content
    ? selected.content.trim().split(/\s+/).filter(Boolean).length
    : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  const handleCopy = () => {
    if (!selected?.content) return
    navigator.clipboard.writeText(selected.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Auto-select first note
  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
            background: 'linear-gradient(135deg, #ffd6a0, #ff6b9d)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NOTES
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''} · markdown supported
          </p>
        </div>
        <Button icon={Plus} onClick={handleNew}>NEW NOTE</Button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 500 }}>
        {/* Left: note list */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#606080' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#dfe2eb',
                fontFamily: 'VT323', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>

          {/* Course filter */}
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              color: '#8c90a0', fontFamily: 'VT323', fontSize: 15, cursor: 'pointer' }}>
            <option value="all">All courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <GlassCard style={{ flex: 1, padding: 10 }}>
            <AnimatePresence>
              {filtered.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.map(note => (
                    <NoteCard
                      key={note.id}
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
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#424754' }}>
                  <StickyNote size={32} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
                  <p style={{ fontFamily: 'VT323', fontSize: 16 }}>
                    {search ? 'No notes match your search' : 'No notes yet'}
                  </p>
                  {!search && (
                    <button onClick={handleNew}
                      style={{ marginTop: 12, padding: '6px 14px', background: 'rgba(255,107,157,0.12)',
                        border: '1px dashed rgba(255,107,157,0.4)', borderRadius: 6,
                        color: '#ff6b9d', fontFamily: 'VT323', fontSize: 15, cursor: 'pointer' }}>
                      + New Note
                    </button>
                  )}
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Right: editor */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {selected ? (
            <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Editor toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Color picker */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {NOTE_COLORS.slice(0, 6).map(c => (
                      <button key={c} onClick={() => handleUpdate('color', c)}
                        style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: 'none',
                          cursor: 'pointer', outline: selected.color === c ? `2px solid ${c}` : 'none',
                          outlineOffset: 2, opacity: selected.color === c ? 1 : 0.55 }} />
                    ))}
                  </div>

                  {/* Course tag */}
                  <select
                    value={selected.courseId || ''}
                    onChange={e => handleUpdate('courseId', e.target.value || null)}
                    style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                      color: '#8c90a0', fontFamily: 'VT323', fontSize: 14, cursor: 'pointer' }}>
                    <option value="">No course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'VT323', fontSize: 13, color: saved ? '#4dff91' : '#ffd6a0' }}>
                    {saved ? '✓ saved' : '● saving…'}
                  </span>
                  <span style={{ fontFamily: 'VT323', fontSize: 13, color: '#424754' }}>
                    {wordCount} words · {readTime} min read
                  </span>
                  <button
                    onClick={handleCopy}
                    title="Copy note to clipboard"
                    style={{ padding: '4px 8px', background: copied ? 'rgba(77,255,145,0.12)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${copied ? 'rgba(77,255,145,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6,
                      color: copied ? '#4dff91' : '#8c90a0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {copied ? <CheckIcon size={12} /> : <Copy size={12} />}
                    <span style={{ fontFamily: 'VT323', fontSize: 13 }}>{copied ? 'COPIED!' : 'COPY'}</span>
                  </button>
                  <button
                    onClick={() => setPreview(p => !p)}
                    style={{ padding: '4px 10px', background: preview ? 'rgba(196,77,255,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${preview ? 'rgba(196,77,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6,
                      color: preview ? '#c44dff' : '#8c90a0', fontFamily: 'VT323', fontSize: 14, cursor: 'pointer' }}>
                    {preview ? 'EDIT' : 'PREVIEW'}
                  </button>
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={generatingCards || !selected?.content?.trim()}
                    title="Generate flashcards from this note using AI"
                    style={{ padding: '4px 10px', background: generatingCards ? 'rgba(77,255,145,0.05)' : 'rgba(77,255,145,0.08)',
                      border: `1px solid ${genSuccess !== null ? (genSuccess > 0 ? 'rgba(77,255,145,0.5)' : 'rgba(255,77,106,0.4)') : 'rgba(77,255,145,0.25)'}`,
                      borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      opacity: (!selected?.content?.trim() || generatingCards) ? 0.5 : 1 }}>
                    {generatingCards
                      ? <span style={{ fontFamily: 'VT323', fontSize: 13, color: '#4dff91' }}>generating…</span>
                      : genSuccess !== null
                      ? <span style={{ fontFamily: 'VT323', fontSize: 13, color: genSuccess > 0 ? '#4dff91' : '#ff8f6b' }}>
                          {genSuccess > 0 ? `✓ ${genSuccess} cards!` : 'no content found'}
                        </span>
                      : <>
                          <Layers size={12} color="#4dff91" />
                          <span style={{ fontFamily: 'VT323', fontSize: 13, color: '#4dff91' }}>AI CARDS</span>
                        </>
                    }
                  </button>
                  <button
                    onClick={handleSummarize}
                    disabled={summarizing || !selected?.content?.trim()}
                    title="Summarize this note into bullet points using AI"
                    style={{ padding: '4px 10px', background: 'rgba(175,198,255,0.08)',
                      border: '1px solid rgba(175,198,255,0.25)',
                      borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      opacity: (!selected?.content?.trim() || summarizing) ? 0.5 : 1 }}>
                    {summarizing
                      ? <span style={{ fontFamily: 'VT323', fontSize: 13, color: '#afc6ff' }}>thinking…</span>
                      : <><Sparkles size={12} color="#afc6ff" /><span style={{ fontFamily: 'VT323', fontSize: 13, color: '#afc6ff' }}>SUMMARIZE</span></>
                    }
                  </button>
                  <button onClick={handleExport}
                    style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer' }}>
                    <Download size={13} color="#8c90a0" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <input
                value={selected.title}
                onChange={e => handleUpdate('title', e.target.value)}
                placeholder="Note title..."
                style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 14,
                  color: '#dfe2eb', fontFamily: '"Press Start 2P"', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box' }}
              />

              {/* Content */}
              {preview ? (
                <div
                  style={{ flex: 1, overflowY: 'auto', fontFamily: 'Manrope, sans-serif', fontSize: 14,
                    lineHeight: 1.7, color: '#c8ccd8', padding: '4px 0' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                />
              ) : (
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={selected.content}
                    onChange={e => handleUpdate('content', e.target.value)}
                    placeholder={'Start writing...\n\nMarkdown supported:\n**bold**, *italic*, `code`\n# Heading 1\n## Heading 2\n- bullet\n1. numbered'}
                    style={{ width: '100%', height: '100%', minHeight: 320, background: 'transparent',
                      border: 'none', resize: 'none', color: '#c8ccd8', fontFamily: 'Manrope, sans-serif',
                      fontSize: 14, lineHeight: 1.75, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Markdown hint */}
              <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[['**bold**', 'b'], ['*italic*', 'i'], ['`code`', 'c'], ['# h1', 'h'], ['- list', '•']].map(([md, label]) => (
                  <span key={label} style={{ fontFamily: 'monospace', fontSize: 11, color: '#424754' }}>{md}</span>
                ))}
              </div>

              {/* AI Summary panel */}
              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginTop: 16 }}
                  >
                    <div style={{
                      padding: '14px 16px', borderRadius: 10,
                      background: 'rgba(175,198,255,0.07)',
                      border: '1px solid rgba(175,198,255,0.20)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#afc6ff', letterSpacing: '0.06em' }}>
                          ✦ AI SUMMARY
                        </span>
                        <button
                          onClick={() => setSummary(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#606080', fontSize: 16, lineHeight: 1 }}
                        >×</button>
                      </div>
                      {summary.split('\n').filter(l => l.trim()).map((line, i) => (
                        <div key={i} style={{
                          fontFamily: 'Manrope, sans-serif', fontSize: 13,
                          color: '#c4c8d4', lineHeight: 1.6,
                          padding: '3px 0',
                          borderBottom: i < summary.split('\n').filter(l => l.trim()).length - 1
                            ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}>{line}</div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ) : (
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', color: '#424754' }} />
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#606080', marginBottom: 10 }}>
                  SELECT A NOTE
                </p>
                <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#424754', marginBottom: 20 }}>
                  Pick a note from the left or create a new one
                </p>
                <Button icon={Plus} onClick={handleNew}>NEW NOTE</Button>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Notes
