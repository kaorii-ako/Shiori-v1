import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Plus, Trash2, ChevronLeft, ChevronRight,
  Check, X, RotateCcw, BookOpen, Zap, Trophy,
  Edit3, ArrowLeft, BarChart3, Upload, Download,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { useFlashcardsStore, useAssignmentsStore } from '../stores'

const COURSE_COLORS = ['#ff6b9d', '#c44dff', '#afc6ff', '#4dff91', '#ffd6a0', '#4daaff']

// ─── Deck List ───────────────────────────────────────────────────────────────
const exportAnki = (deck) => {
  const tsv = deck.cards.map(c => `${c.front}\t${c.back}`).join('\n')
  const blob = new Blob([tsv], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${deck.name.replace(/\s+/g, '-')}-anki.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}

const DeckCard = ({ deck, course, onStudy, onEdit, onDelete }) => {
  const mastered = deck.cards.filter(c => (c.streak || 0) >= 3).length
  const total = deck.cards.length
  const pct = total > 0 ? Math.round(mastered / total * 100) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2 }}
      style={{
        padding: '18px 20px', borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: `2px solid ${course?.color ? course.color + '33' : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: '"Press Start 2P"', fontSize: 11, color: '#dfe2eb', marginBottom: 6 }}>
            {deck.name}
          </h3>
          {course && (
            <span style={{ fontFamily: 'VT323', fontSize: 14, color: course.color,
              padding: '2px 8px', background: `${course.color}18`, borderRadius: 20 }}>
              {course.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); exportAnki(deck) }}
            title="Export to Anki (.txt)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <Download size={13} color="#ffd6a0" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <Edit3 size={13} color="#afc6ff" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <Trash2 size={13} color="#ff4d6a" />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'CARDS', value: total, color: '#afc6ff' },
          { label: 'MASTERED', value: mastered, color: '#4dff91' },
          { label: 'PROGRESS', value: `${pct}%`, color: pct >= 80 ? '#4dff91' : pct >= 50 ? '#ffd6a0' : '#ff8f6b' },
        ].map(s => (
          <div key={s.label} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, textAlign: 'center' }}>
            <p style={{ fontFamily: 'VT323', fontSize: 12, color: '#606080', marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontFamily: '"Press Start 2P"', fontSize: 13, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2,
          background: `linear-gradient(90deg, ${course?.color || '#c44dff'}, #4dff91)`,
          transition: 'width 0.4s ease' }} />
      </div>

      <Button onClick={onStudy} icon={Zap} style={{ width: '100%' }}
        disabled={total === 0}>
        {total === 0 ? 'ADD CARDS FIRST' : 'STUDY NOW'}
      </Button>
    </motion.div>
  )
}

// ─── Study Mode ───────────────────────────────────────────────────────────────
const StudyMode = ({ deck, onExit, onUpdateCard }) => {
  const due = useMemo(() => {
    const now = Date.now()
    return deck.cards
      .filter(c => !c.nextReview || c.nextReview <= now)
      .sort(() => Math.random() - 0.5)
  }, [deck.id])

  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 })
  const [done, setDone] = useState(false)
  const [flipDir, setFlipDir] = useState(1)

  if (due.length === 0 || done) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Trophy size={64} style={{ margin: '0 auto 20px', color: '#ffd6a0' }} />
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 16, color: '#4dff91', marginBottom: 12 }}>
          SESSION COMPLETE!
        </h2>
        {sessionStats.total > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 360, margin: '0 auto 28px' }}>
            {[
              { label: 'STUDIED', value: sessionStats.total, color: '#afc6ff' },
              { label: 'CORRECT', value: sessionStats.correct, color: '#4dff91' },
              { label: 'SCORE', value: `${Math.round(sessionStats.correct / sessionStats.total * 100)}%`, color: '#ffd6a0' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'VT323', fontSize: 13, color: '#606080', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 18, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginBottom: 28 }}>
            All cards are up to date — come back later!
          </p>
        )}
        <Button onClick={onExit} icon={ArrowLeft}>BACK TO DECKS</Button>
      </div>
    )
  }

  const card = due[idx]
  const progress = `${Math.min(idx + 1, due.length)} / ${due.length}`

  const answer = (correct) => {
    const now = Date.now()
    const streak = correct ? (card.streak || 0) + 1 : 0
    // Simple spaced repetition: interval doubles each streak (1h, 2h, 4h, 1d, 2d...)
    const intervals = [3600000, 7200000, 86400000, 172800000, 432000000]
    const interval = correct ? (intervals[Math.min(streak - 1, intervals.length - 1)] || intervals[0]) : 600000
    onUpdateCard(deck.id, card.id, { streak, nextReview: now + interval })

    setSessionStats(p => ({
      correct: p.correct + (correct ? 1 : 0),
      incorrect: p.incorrect + (correct ? 0 : 1),
      total: p.total + 1,
    }))

    setFlipDir(correct ? 1 : -1)
    setFlipped(false)
    if (idx + 1 >= due.length) {
      setTimeout(() => setDone(true), 300)
    } else {
      setTimeout(() => setIdx(i => i + 1), 300)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={onExit}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            cursor: 'pointer', color: '#8c90a0', fontFamily: 'VT323', fontSize: 16, padding: 0 }}>
          <ArrowLeft size={16} />
          Back
        </button>
        <span style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>{progress}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#4dff91' }}>✓ {sessionStats.correct}</span>
          <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#ff4d6a' }}>✗ {sessionStats.incorrect}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 32 }}>
        <div style={{ height: '100%', width: `${idx / due.length * 100}%`, borderRadius: 2,
          background: 'linear-gradient(90deg, #afc6ff, #c44dff)', transition: 'width 0.3s' }} />
      </div>

      {/* Card */}
      <div style={{ perspective: 1000, marginBottom: 28, cursor: 'pointer' }} onClick={() => setFlipped(f => !f)}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 240 }}
        >
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            padding: '40px 32px', borderRadius: 16, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(175,198,255,0.08), rgba(196,77,255,0.08))',
            border: '2px solid rgba(175,198,255,0.2)',
          }}>
            <p style={{ fontFamily: 'VT323', fontSize: 12, color: '#606080', marginBottom: 16, letterSpacing: 2 }}>QUESTION</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, color: '#dfe2eb', lineHeight: 1.5 }}>{card.front}</p>
            <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#424754', marginTop: 24 }}>tap to reveal answer</p>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            padding: '40px 32px', borderRadius: 16, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(77,255,145,0.06), rgba(77,170,255,0.06))',
            border: '2px solid rgba(77,255,145,0.2)',
          }}>
            <p style={{ fontFamily: 'VT323', fontSize: 12, color: '#606080', marginBottom: 16, letterSpacing: 2 }}>ANSWER</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, color: '#dfe2eb', lineHeight: 1.5 }}>{card.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Answer buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <button
              onClick={() => answer(false)}
              style={{ padding: '16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,77,106,0.1)', border: '2px solid rgba(255,77,106,0.4)',
                color: '#ff4d6a', fontFamily: '"Press Start 2P"', fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <X size={16} /> MISSED IT
            </button>
            <button
              onClick={() => answer(true)}
              style={{ padding: '16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(77,255,145,0.1)', border: '2px solid rgba(77,255,145,0.4)',
                color: '#4dff91', fontFamily: '"Press Start 2P"', fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Check size={16} /> GOT IT
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(card.streak || 0) > 0 && (
        <p style={{ textAlign: 'center', fontFamily: 'VT323', fontSize: 14, color: '#424754', marginTop: 12 }}>
          Streak: {'🔥'.repeat(Math.min(card.streak || 0, 5))} {card.streak}
        </p>
      )}
    </div>
  )
}

// ─── Card Editor ─────────────────────────────────────────────────────────────
const DeckEditor = ({ deck, onClose, onAddCard, onRemoveCard }) => {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')

  const handleAdd = () => {
    if (!front.trim() || !back.trim()) return
    onAddCard(deck.id, { front: front.trim(), back: back.trim() })
    setFront('')
    setBack('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#8c90a0' }}>ADD NEW CARD</p>
        <textarea
          value={front}
          onChange={e => setFront(e.target.value)}
          placeholder="Question / Front side..."
          rows={2}
          style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
            color: '#dfe2eb', fontFamily: 'Manrope, sans-serif', fontSize: 14,
            resize: 'vertical', outline: 'none' }}
        />
        <textarea
          value={back}
          onChange={e => setBack(e.target.value)}
          placeholder="Answer / Back side..."
          rows={2}
          style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
            color: '#dfe2eb', fontFamily: 'Manrope, sans-serif', fontSize: 14,
            resize: 'vertical', outline: 'none' }}
        />
        <Button icon={Plus} onClick={handleAdd} disabled={!front.trim() || !back.trim()}>
          ADD CARD
        </Button>
      </div>

      {deck.cards.length > 0 && (
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', marginBottom: 6 }}>
            {deck.cards.length} CARD{deck.cards.length !== 1 ? 'S' : ''}
          </p>
          {deck.cards.map((card, i) => (
            <div key={card.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'VT323', fontSize: 16, color: '#dfe2eb', marginBottom: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Q: {card.front}
                </p>
                <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  A: {card.back}
                </p>
              </div>
              {(card.streak || 0) >= 3 && <span title="Mastered">🏆</span>}
              <button onClick={() => onRemoveCard(deck.id, card.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5, flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                <Trash2 size={12} color="#ff4d6a" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const parseCSV = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const cards = []
  for (const line of lines) {
    // Support: tab, comma, semicolon separators
    const parts = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)|;/)
    if (parts.length >= 2) {
      const front = parts[0].replace(/^"|"$/g, '').trim()
      const back = parts[1].replace(/^"|"$/g, '').trim()
      if (front && back) cards.push({ front, back })
    }
  }
  return cards
}

const Flashcards = () => {
  const { decks, addDeck, deleteDeck, addCard, removeCard, updateCard, loadDeck } = useFlashcardsStore()
  const { courses } = useAssignmentsStore()

  const [studyDeck, setStudyDeck] = useState(null)
  const [editDeck, setEditDeck] = useState(null)
  const [newDeckModal, setNewDeckModal] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckCourse, setNewDeckCourse] = useState('')
  const [importModal, setImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importName, setImportName] = useState('')
  const [importPreview, setImportPreview] = useState([])

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0)
  const totalMastered = decks.reduce((s, d) => s + d.cards.filter(c => (c.streak || 0) >= 3).length, 0)
  const dueNow = decks.reduce((s, d) => s + d.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length, 0)

  const handleImport = () => {
    const cards = parseCSV(importText)
    if (cards.length === 0 || !importName.trim()) return
    const deckId = `deck-${Date.now()}`
    loadDeck({
      id: deckId,
      name: importName.trim(),
      courseId: null,
      createdAt: Date.now(),
      cards: cards.map((c, i) => ({ id: `card-${deckId}-${i}`, front: c.front, back: c.back, streak: 0, nextReview: null })),
    })
    setImportModal(false)
    setImportText('')
    setImportName('')
    setImportPreview([])
  }

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return
    addDeck({ name: newDeckName.trim(), courseId: newDeckCourse || null })
    setNewDeckName('')
    setNewDeckCourse('')
    setNewDeckModal(false)
  }

  if (studyDeck) {
    const deck = decks.find(d => d.id === studyDeck)
    if (!deck) { setStudyDeck(null); return null }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <GlassCard>
          <StudyMode
            deck={deck}
            onExit={() => setStudyDeck(null)}
            onUpdateCard={updateCard}
          />
        </GlassCard>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
            background: 'linear-gradient(135deg, #4dff91, #afc6ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FLASHCARDS
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
            Spaced repetition — study smarter, not longer
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={Upload} size="sm"
            onClick={() => setImportModal(true)}
            style={{ borderColor: '#ffd6a0', color: '#ffd6a0' }}>
            IMPORT CSV
          </Button>
          <Button icon={Plus} onClick={() => setNewDeckModal(true)}>NEW DECK</Button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'TOTAL CARDS', value: totalCards, color: '#afc6ff', icon: Layers },
            { label: 'MASTERED', value: totalMastered, color: '#4dff91', icon: Trophy },
            { label: 'DUE NOW', value: dueNow, color: dueNow > 0 ? '#ffd6a0' : '#4dff91', icon: Zap },
          ].map(s => (
            <GlassCard key={s.label} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'VT323', fontSize: 13, color: '#606080', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: '"Press Start 2P"', fontSize: 22, color: s.color }}>{s.value}</p>
                </div>
                <s.icon size={22} style={{ color: s.color, opacity: 0.5 }} />
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Deck grid */}
      {decks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {decks.map(deck => {
            const course = courses.find(c => c.id === deck.courseId)
            return (
              <DeckCard
                key={deck.id}
                deck={deck}
                course={course}
                onStudy={() => setStudyDeck(deck.id)}
                onEdit={() => setEditDeck(deck)}
                onDelete={() => deleteDeck(deck.id)}
              />
            )
          })}
        </div>
      ) : (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Layers size={48} style={{ margin: '0 auto 16px', color: '#424754' }} />
            <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#606080', marginBottom: 10 }}>
              NO DECKS YET
            </p>
            <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#424754', marginBottom: 20 }}>
              Create a flashcard deck to start studying with spaced repetition
            </p>
            <Button icon={Plus} onClick={() => setNewDeckModal(true)}>CREATE YOUR FIRST DECK</Button>
          </div>
        </GlassCard>
      )}

      {/* New Deck Modal */}
      <Modal isOpen={newDeckModal} onClose={() => setNewDeckModal(false)} title="New Flashcard Deck" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewDeckModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>Create Deck</Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Deck Name" value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            placeholder="Integration Techniques, WWI Key Terms..." />
          <div>
            <label style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', display: 'block', marginBottom: 8 }}>
              COURSE (OPTIONAL)
            </label>
            <select value={newDeckCourse} onChange={e => setNewDeckCourse(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: '#dfe2eb', fontFamily: 'VT323', fontSize: 16, cursor: 'pointer' }}>
              <option value="">No course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal isOpen={importModal} onClose={() => { setImportModal(false); setImportText(''); setImportPreview([]) }}
        title="Import Flashcards (CSV / Quizlet)" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportModal(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={importPreview.length === 0 || !importName.trim()}>
              Import {importPreview.length > 0 ? `${importPreview.length} Cards` : ''}
            </Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Deck Name" value={importName}
            onChange={e => setImportName(e.target.value)} placeholder="My Imported Deck" />
          <div>
            <label style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', display: 'block', marginBottom: 6 }}>
              PASTE CSV (FRONT TAB/COMMA BACK)
            </label>
            <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080', marginBottom: 8 }}>
              Works with Quizlet export, Anki CSV, or any tab/comma-separated front↔back format.
            </p>
            <textarea
              value={importText}
              onChange={e => {
                setImportText(e.target.value)
                setImportPreview(parseCSV(e.target.value).slice(0, 5))
              }}
              placeholder={'What is photosynthesis?\tConversion of light to chemical energy\nMitosis vs Meiosis\tMitosis: 2 identical cells; Meiosis: 4 sex cells'}
              rows={6}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#dfe2eb',
                fontFamily: 'monospace', fontSize: 12, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {importPreview.length > 0 && (
            <div style={{ padding: '10px 12px', background: 'rgba(77,255,145,0.06)',
              border: '1px solid rgba(77,255,145,0.2)', borderRadius: 8 }}>
              <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#4dff91', marginBottom: 8 }}>
                PREVIEW ({parseCSV(importText).length} cards detected)
              </p>
              {importPreview.map((c, i) => (
                <div key={i} style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0', marginBottom: 3 }}>
                  <span style={{ color: '#afc6ff' }}>Q:</span> {c.front.slice(0, 40)}{c.front.length > 40 ? '…' : ''}&nbsp;&nbsp;
                  <span style={{ color: '#4dff91' }}>A:</span> {c.back.slice(0, 40)}{c.back.length > 40 ? '…' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Deck Modal */}
      {editDeck && (
        <Modal isOpen={!!editDeck} onClose={() => setEditDeck(null)}
          title={`Edit — ${editDeck.name}`} size="md">
          <DeckEditor
            deck={decks.find(d => d.id === editDeck.id) || editDeck}
            onClose={() => setEditDeck(null)}
            onAddCard={addCard}
            onRemoveCard={removeCard}
          />
        </Modal>
      )}
    </div>
  )
}

export default Flashcards
