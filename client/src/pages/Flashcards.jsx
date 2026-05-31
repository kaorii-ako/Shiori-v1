import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Plus, Trash2,
  Check, X, Zap, Trophy,
  Edit3, ArrowLeft, Upload, Download, Search,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useFlashcardsStore, useAssignmentsStore, useXPStore } from '../stores'

// ─── Design tokens ────────────────────────────────────────────────────────────
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

const card = {
  background: 'rgba(13,17,24,0.95)',
  border: '1px solid rgba(50,55,70,0.4)',
  borderRadius: 12,
  padding: '20px 24px',
}

const btnPrimary = {
  padding: '9px 20px', borderRadius: 8,
  background: 'linear-gradient(135deg, #c44dff, #528dff)',
  color: '#fff', border: 'none',
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
  fontSize: 13, cursor: 'pointer',
}

const btnSecondary = {
  padding: '8px 16px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: '#dfe2eb',
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
  fontSize: 13, cursor: 'pointer',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: '#dfe2eb', outline: 'none',
  fontFamily: "'Manrope', sans-serif", fontSize: 14,
  boxSizing: 'border-box',
}

const labelSt = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600, fontSize: 11,
  letterSpacing: '0.08em',
  color: T.muted, display: 'block', marginBottom: 6,
}

// ─── Export to Anki ───────────────────────────────────────────────────────────
const exportAnki = (deck) => {
  const tsv = deck.cards.map(c => `${c.front}\t${c.back}`).join('\n')
  const blob = new Blob([tsv], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${deck.name.replace(/\s+/g, '-')}-anki.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Deck Card ────────────────────────────────────────────────────────────────
const DeckCard = ({ deck, course, onStudy, onEdit, onDelete, idx }) => {
  const mastered = deck.cards.filter(c => (c.streak || 0) >= 3).length
  const total = deck.cards.length
  const pct = total > 0 ? Math.round(mastered / total * 100) : 0
  const due = deck.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length
  const accent = course?.color || T.purpleVibrant

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -2 }}
      style={{
        background: 'rgba(13,17,24,0.95)',
        border: '1px solid rgba(50,55,70,0.4)',
        borderTop: `2px solid ${accent}55`,
        borderRadius: 12,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 15, color: T.text, margin: '0 0 6px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {deck.name}
          </h3>
          {course && (
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              fontSize: 11, letterSpacing: '0.08em',
              color: accent, padding: '2px 8px',
              background: `${accent}18`, borderRadius: 20,
            }}>
              {course.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {[
            { icon: Download, color: T.orange, label: 'Export to Anki', action: (e) => { e.stopPropagation(); exportAnki(deck) } },
            { icon: Edit3, color: T.blue, label: 'Edit', action: (e) => { e.stopPropagation(); onEdit() } },
            { icon: Trash2, color: T.pink, label: 'Delete', action: (e) => { e.stopPropagation(); onDelete() } },
          ].map(({ icon: Icon, color, label, action }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, opacity: 0.45, display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
            >
              <Icon size={13} color={color} />
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
          <span style={{ color: T.text, fontWeight: 600 }}>{total}</span> cards
        </span>
        <span style={{ color: T.faint, fontSize: 11 }}>·</span>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
          <span style={{ color: T.green, fontWeight: 600 }}>{mastered}</span> mastered
        </span>
        {due > 0 && (
          <>
            <span style={{ color: T.faint, fontSize: 11 }}>·</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              fontSize: 11, letterSpacing: '0.08em',
              background: 'rgba(196,77,255,0.15)', color: '#c44dff',
              padding: '2px 8px', borderRadius: 10,
            }}>
              {due} due
            </span>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ ...labelSt, margin: 0, fontSize: 10 }}>MASTERY</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
            color: pct >= 80 ? T.green : T.muted,
          }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 4,
            background: `linear-gradient(90deg, ${accent}, ${T.green})`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onStudy}
          disabled={total === 0}
          style={{
            ...btnPrimary, flex: 1,
            opacity: total === 0 ? 0.4 : 1,
            cursor: total === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Zap size={13} /> Study
        </button>
        <button
          onClick={onEdit}
          style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Edit3 size={13} /> Edit
        </button>
      </div>
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

  const { addXP } = useXPStore()
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 })
  const [done, setDone] = useState(false)
  // flipDir kept to preserve existing SRS behaviour reference
  const [flipDir, setFlipDir] = useState(1)

  if (due.length === 0 || done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '80px 24px' }}
      >
        <Trophy size={52} style={{ margin: '0 auto 20px', color: T.orange }} />
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
          fontSize: 22, color: T.green, marginBottom: 8,
        }}>
          Session Complete!
        </h2>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, color: T.muted, marginBottom: 32 }}>
          {sessionStats.total > 0
            ? `You scored ${Math.round(sessionStats.correct / sessionStats.total * 100)}% this session`
            : 'All cards are up to date — come back later!'}
        </p>
        {sessionStats.total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 360, margin: '0 auto 32px' }}>
            {[
              { label: 'STUDIED', value: sessionStats.total, color: T.blue },
              { label: 'CORRECT', value: sessionStats.correct, color: T.green },
              { label: 'SCORE', value: `${Math.round(sessionStats.correct / sessionStats.total * 100)}%`, color: T.orange },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ ...labelSt, marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: s.color, margin: 0 }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onExit}
          style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> Back to Decks
        </button>
      </motion.div>
    )
  }

  const currentCard = due[idx]

  const answer = (correct) => {
    const now = Date.now()
    const streak = correct ? (currentCard.streak || 0) + 1 : 0
    // Simple spaced repetition: interval doubles each streak (1h, 2h, 4h, 1d, 2d...)
    const intervals = [3600000, 7200000, 86400000, 172800000, 432000000]
    const interval = correct ? (intervals[Math.min(streak - 1, intervals.length - 1)] || intervals[0]) : 600000
    onUpdateCard(deck.id, currentCard.id, { streak, nextReview: now + interval })
    if (correct) addXP(5, 'flashcard_correct')

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
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}
      >
        <button
          onClick={onExit}
          style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>
            Card {Math.min(idx + 1, due.length)} of {due.length}
          </p>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 2 }}>
            {deck.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.green }}>
            <Check size={13} /> {sessionStats.correct}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.pink }}>
            <X size={13} /> {sessionStats.incorrect}
          </span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 32 }}>
        <motion.div
          style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #c44dff, #528dff)' }}
          animate={{ width: `${idx / due.length * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 3D Flip Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ perspective: 1200, marginBottom: 24, cursor: 'pointer' }}
        onClick={() => setFlipped(f => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 260 }}
        >
          {/* Front face */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            background: 'rgba(13,17,24,0.98)',
            border: '1px solid rgba(50,55,70,0.4)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
            flexDirection: 'column', textAlign: 'center', boxSizing: 'border-box',
          }}>
            <p style={{ ...labelSt, color: T.faint, marginBottom: 16 }}>QUESTION</p>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 20, color: T.text, lineHeight: 1.55, margin: 0,
            }}>
              {currentCard.front}
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint, marginTop: 24 }}>
              Tap to reveal answer
            </p>
          </div>

          {/* Back face */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'rgba(13,17,24,0.98)',
            border: '1px solid rgba(77,255,145,0.2)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
            flexDirection: 'column', textAlign: 'center', boxSizing: 'border-box',
          }}>
            <p style={{ ...labelSt, color: T.faint, marginBottom: 16 }}>ANSWER</p>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 20, color: T.text, lineHeight: 1.55, margin: 0,
            }}>
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Correct / Incorrect buttons */}
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
              style={{
                padding: '14px 20px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,107,157,0.08)',
                border: '1px solid rgba(255,107,157,0.3)',
                color: T.pink,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <X size={15} /> Incorrect
            </button>
            <button
              onClick={() => answer(true)}
              style={{
                padding: '14px 20px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(77,255,145,0.08)',
                border: '1px solid rgba(77,255,145,0.3)',
                color: T.green,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Check size={15} /> Correct
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(currentCard.streak || 0) > 0 && (
        <p style={{ textAlign: 'center', fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, marginTop: 16 }}>
          Streak: {'🔥'.repeat(Math.min(currentCard.streak || 0, 5))} {currentCard.streak}
        </p>
      )}
    </div>
  )
}

// ─── Deck Editor ──────────────────────────────────────────────────────────────
const DeckEditor = ({ deck, onClose, onAddCard, onRemoveCard, onAIGenerate, aiGenerating, onImportCSV }) => {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [search, setSearch] = useState('')
  const [aiTopic, setAiTopic] = useState('')
  const [showAI, setShowAI] = useState(false)

  const handleAdd = () => {
    if (!front.trim() || !back.trim()) return
    onAddCard(deck.id, { front: front.trim(), back: back.trim() })
    setFront('')
    setBack('')
  }

  const q = search.toLowerCase().trim()
  const filteredCards = q
    ? deck.cards.filter(c => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q))
    : deck.cards

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: T.text, margin: 0 }}>
              {deck.name}
            </h2>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, marginTop: 2 }}>
              {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onImportCSV}
            style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={() => setShowAI(v => !v)}
            style={{
              ...btnSecondary,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              borderColor: showAI ? 'rgba(196,77,255,0.4)' : undefined,
              color: showAI ? T.purpleVibrant : T.text,
            }}
          >
            <Zap size={13} /> AI Generate
          </button>
        </div>
      </div>

      {/* AI Generate panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ ...card, borderColor: 'rgba(196,77,255,0.3)' }}>
              <p style={{ ...labelSt, color: T.purpleVibrant, marginBottom: 10 }}>AI GENERATE CARDS</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Topic or paste notes to generate cards from..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => onAIGenerate(deck.id, aiTopic, () => { setAiTopic(''); setShowAI(false) })}
                  disabled={!aiTopic.trim() || aiGenerating}
                  style={{
                    ...btnPrimary,
                    opacity: (!aiTopic.trim() || aiGenerating) ? 0.5 : 1,
                    cursor: (!aiTopic.trim() || aiGenerating) ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Zap size={13} />
                  {aiGenerating ? 'Generating…' : 'Generate'}
                </button>
              </div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint, marginTop: 8 }}>
                Generates up to 10 cards using AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add card form */}
      <div style={{ ...card }}>
        <p style={{ ...labelSt, marginBottom: 12 }}>ADD NEW CARD</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ ...labelSt, fontSize: 10, marginBottom: 6 }}>FRONT</p>
            <textarea
              value={front}
              onChange={e => setFront(e.target.value)}
              placeholder="Question / Front side..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div>
            <p style={{ ...labelSt, fontSize: 10, marginBottom: 6 }}>BACK</p>
            <textarea
              value={back}
              onChange={e => setBack(e.target.value)}
              placeholder="Answer / Back side..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!front.trim() || !back.trim()}
          style={{
            ...btnPrimary,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            opacity: (!front.trim() || !back.trim()) ? 0.4 : 1,
            cursor: (!front.trim() || !back.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={13} /> Add Card
        </button>
      </div>

      {/* Card list */}
      {deck.cards.length > 0 && (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
            <p style={{ ...labelSt, margin: 0 }}>
              {q ? `${filteredCards.length} / ${deck.cards.length} CARDS` : `${deck.cards.length} CARD${deck.cards.length !== 1 ? 'S' : ''}`}
            </p>
            <div style={{ position: 'relative', width: 200 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.faint, pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards..."
                style={{ ...inputStyle, padding: '7px 10px 7px 28px', fontSize: 12 }}
              />
            </div>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 36px',
            gap: 12, padding: '6px 12px',
            borderBottom: `1px solid ${T.border}`, marginBottom: 6,
          }}>
            <span style={{ ...labelSt, margin: 0, fontSize: 10 }}>FRONT</span>
            <span style={{ ...labelSt, margin: 0, fontSize: 10 }}>BACK</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
            {filteredCards.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 36px',
                  gap: 12, padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(50,55,70,0.25)',
                  borderRadius: 8, alignItems: 'center',
                }}
              >
                <p style={{
                  fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.text,
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.front}
                  {(c.streak || 0) >= 3 && <span style={{ marginLeft: 6 }} title="Mastered">🏆</span>}
                </p>
                <p style={{
                  fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted,
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.back}
                </p>
                <button
                  onClick={() => onRemoveCard(deck.id, c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.4, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                >
                  <Trash2 size={13} color={T.pink} />
                </button>
              </motion.div>
            ))}
            {filteredCards.length === 0 && q && (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.faint, textAlign: 'center', padding: '24px 0' }}>
                No cards match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Parse CSV ────────────────────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [aiGenerating, setAiGenerating] = useState(false)

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

  const handleAIGenerate = async (deckId, topic, onDone) => {
    if (!topic.trim() || aiGenerating) return
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, deckId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.cards)) {
          data.cards.forEach(c => addCard(deckId, { front: c.front, back: c.back }))
        }
      }
    } finally {
      setAiGenerating(false)
      onDone?.()
    }
  }

  const closeImportModal = () => {
    setImportModal(false)
    setImportText('')
    setImportPreview([])
  }

  // ── Study view ──────────────────────────────────────────────────────────────
  if (studyDeck) {
    const deck = decks.find(d => d.id === studyDeck)
    if (!deck) { setStudyDeck(null); return null }
    return (
      <div style={{ padding: '24px 0' }}>
        <StudyMode
          deck={deck}
          onExit={() => setStudyDeck(null)}
          onUpdateCard={updateCard}
        />
      </div>
    )
  }

  // ── Editor view ─────────────────────────────────────────────────────────────
  if (editDeck) {
    const deck = decks.find(d => d.id === editDeck.id) || editDeck
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <DeckEditor
          deck={deck}
          onClose={() => setEditDeck(null)}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          onAIGenerate={handleAIGenerate}
          aiGenerating={aiGenerating}
          onImportCSV={() => setImportModal(true)}
        />

        {/* Import CSV Modal (reused from deck list) */}
        <Modal
          isOpen={importModal}
          onClose={closeImportModal}
          title="Import Flashcards"
          size="md"
          footer={
            <>
              <button onClick={closeImportModal} style={btnSecondary}>Cancel</button>
              <button
                onClick={handleImport}
                disabled={importPreview.length === 0 || !importName.trim()}
                style={{
                  ...btnPrimary,
                  opacity: (importPreview.length === 0 || !importName.trim()) ? 0.5 : 1,
                  cursor: (importPreview.length === 0 || !importName.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                Import {importPreview.length > 0 ? `${importPreview.length} Cards` : ''}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelSt}>DECK NAME</label>
              <input value={importName} onChange={e => setImportName(e.target.value)} placeholder="My Imported Deck" style={inputStyle} />
            </div>
            <div>
              <label style={labelSt}>PASTE CSV (FRONT TAB/COMMA BACK)</label>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, marginBottom: 8 }}>
                Works with Quizlet export, Anki CSV, or any tab/comma-separated front↔back format.
              </p>
              <textarea
                value={importText}
                onChange={e => { setImportText(e.target.value); setImportPreview(parseCSV(e.target.value).slice(0, 5)) }}
                placeholder={'What is photosynthesis?\tConversion of light to chemical energy'}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
            {importPreview.length > 0 && (
              <div style={{ padding: '12px 14px', background: 'rgba(77,255,145,0.04)', border: '1px solid rgba(77,255,145,0.2)', borderRadius: 8 }}>
                <p style={{ ...labelSt, color: T.green, marginBottom: 8 }}>
                  PREVIEW — {parseCSV(importText).length} cards detected
                </p>
                {importPreview.map((c, i) => (
                  <div key={i} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, marginBottom: 4 }}>
                    <span style={{ color: T.blue }}>Q:</span> {c.front.slice(0, 40)}{c.front.length > 40 ? '…' : ''}&nbsp;&nbsp;
                    <span style={{ color: T.green }}>A:</span> {c.back.slice(0, 40)}{c.back.length > 40 ? '…' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    )
  }

  // ── Deck list view ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 26, margin: 0,
            background: 'linear-gradient(135deg, #4dff91, #afc6ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Flashcards
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 4 }}>
            Spaced repetition — study smarter, not longer
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setImportModal(true)}
            style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={() => setNewDeckModal(true)}
            style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={13} /> New Deck
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
      >
        {[
          { label: 'TOTAL CARDS', value: totalCards, color: T.blue, Icon: Layers },
          { label: 'MASTERED', value: totalMastered, color: T.green, Icon: Trophy },
          { label: 'DUE NOW', value: dueNow, color: dueNow > 0 ? T.orange : T.green, Icon: Zap },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ ...labelSt }}>{label}</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color, margin: 0 }}>
                  {value}
                </p>
              </div>
              <Icon size={22} style={{ color, opacity: 0.4 }} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Deck grid */}
      {decks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {decks.map((deck, idx) => {
            const course = courses.find(c => c.id === deck.courseId)
            return (
              <DeckCard
                key={deck.id}
                deck={deck}
                course={course}
                idx={idx}
                onStudy={() => setStudyDeck(deck.id)}
                onEdit={() => setEditDeck(deck)}
                onDelete={() => deleteDeck(deck.id)}
              />
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ ...card, textAlign: 'center', padding: '64px 24px' }}
        >
          <Layers size={48} style={{ margin: '0 auto 16px', color: T.faint }} />
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: T.muted, marginBottom: 10 }}>
            No decks yet
          </h3>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.faint, marginBottom: 24 }}>
            Create a flashcard deck to start studying with spaced repetition
          </p>
          <button
            onClick={() => setNewDeckModal(true)}
            style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={13} /> Create Your First Deck
          </button>
        </motion.div>
      )}

      {/* New Deck Modal */}
      <Modal
        isOpen={newDeckModal}
        onClose={() => setNewDeckModal(false)}
        title="New Flashcard Deck"
        size="sm"
        footer={
          <>
            <button onClick={() => setNewDeckModal(false)} style={btnSecondary}>Cancel</button>
            <button
              onClick={handleCreateDeck}
              disabled={!newDeckName.trim()}
              style={{ ...btnPrimary, opacity: !newDeckName.trim() ? 0.5 : 1, cursor: !newDeckName.trim() ? 'not-allowed' : 'pointer' }}
            >
              Create Deck
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelSt}>DECK NAME</label>
            <input
              value={newDeckName}
              onChange={e => setNewDeckName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateDeck()}
              placeholder="Integration Techniques, WWI Key Terms..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelSt}>COURSE (OPTIONAL)</label>
            <select
              value={newDeckCourse}
              onChange={e => setNewDeckCourse(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">No course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={importModal}
        onClose={closeImportModal}
        title="Import Flashcards"
        size="md"
        footer={
          <>
            <button onClick={closeImportModal} style={btnSecondary}>Cancel</button>
            <button
              onClick={handleImport}
              disabled={importPreview.length === 0 || !importName.trim()}
              style={{
                ...btnPrimary,
                opacity: (importPreview.length === 0 || !importName.trim()) ? 0.5 : 1,
                cursor: (importPreview.length === 0 || !importName.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              Import {importPreview.length > 0 ? `${importPreview.length} Cards` : ''}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelSt}>DECK NAME</label>
            <input value={importName} onChange={e => setImportName(e.target.value)} placeholder="My Imported Deck" style={inputStyle} />
          </div>
          <div>
            <label style={labelSt}>PASTE CSV (FRONT TAB/COMMA BACK)</label>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, marginBottom: 8 }}>
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
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>
          {importPreview.length > 0 && (
            <div style={{ padding: '12px 14px', background: 'rgba(77,255,145,0.04)', border: '1px solid rgba(77,255,145,0.2)', borderRadius: 8 }}>
              <p style={{ ...labelSt, color: T.green, marginBottom: 8 }}>
                PREVIEW — {parseCSV(importText).length} cards detected
              </p>
              {importPreview.map((c, i) => (
                <div key={i} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, marginBottom: 4 }}>
                  <span style={{ color: T.blue }}>Q:</span> {c.front.slice(0, 40)}{c.front.length > 40 ? '…' : ''}&nbsp;&nbsp;
                  <span style={{ color: T.green }}>A:</span> {c.back.slice(0, 40)}{c.back.length > 40 ? '…' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Flashcards
