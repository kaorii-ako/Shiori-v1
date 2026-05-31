import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Sparkles, CheckCircle2, XCircle, RefreshCw,
  Trophy, ChevronRight, FileText, Type, AlertCircle, Share2,
} from 'lucide-react'
import { useNotesStore } from '../stores'
import { callGeminiClient, hasClientKey } from '../utils/gemini'

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

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: T.text, outline: 'none',
  fontFamily: "'Manrope', sans-serif", fontSize: 14,
  boxSizing: 'border-box',
}

const primaryBtn = {
  padding: '9px 20px', borderRadius: 8,
  background: 'linear-gradient(135deg, #c44dff, #528dff)',
  color: '#fff', border: 'none',
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
  fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
}

const secondaryBtn = {
  padding: '8px 16px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: T.text,
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
  fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
}

const QUIZ_KEY = 'shiori-quiz-history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || '[]') } catch { return [] }
}
function saveHistory(entry) {
  const h = loadHistory()
  h.unshift(entry)
  localStorage.setItem(QUIZ_KEY, JSON.stringify(h.slice(0, 20)))
}

async function generateQuiz(sourceText, count = 5) {
  const prompt = `You are a quiz generator. Given the following study material, create exactly ${count} multiple-choice questions.

STUDY MATERIAL:
${sourceText.slice(0, 3000)}

Return ONLY valid JSON (no markdown, no code blocks), in this exact format:
[
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct": 0,
    "explanation": "Brief explanation why this is correct."
  }
]

Rules:
- "correct" is the 0-based index into "options"
- All 4 options must be plausible
- Questions must be factual and based only on the material provided
- No trick questions`

  const raw = await callGeminiClient(prompt)
  if (!raw) return null
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch { return null }
}

function getGrade(pct) {
  if (pct >= 90) return { letter: 'A', color: T.green }
  if (pct >= 80) return { letter: 'B', color: T.green }
  if (pct >= 70) return { letter: 'C', color: T.orange }
  if (pct >= 60) return { letter: 'D', color: T.orange }
  return { letter: 'F', color: T.pink }
}

const ScoreRing = ({ score, total }) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  const { letter, color } = getGrade(pct)
  const R = 52
  const CIRC = 2 * Math.PI * R
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="70" cy="70" r={R} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC * (1 - pct / 100) }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 28, color, lineHeight: 1,
          }}>{pct}%</span>
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 11, color: T.muted,
          }}>{score}/{total}</span>
        </div>
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`,
        border: `2px solid ${color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        fontSize: 24, color,
      }}>{letter}</div>
    </div>
  )
}

const OptionBtn = ({ label, selected, correct, revealed, onClick, index }) => {
  let bg = 'rgba(20,25,34,0.7)'
  let border = T.border
  let textColor = T.muted
  let icon = null
  if (revealed) {
    if (correct) {
      bg = 'rgba(77,255,145,0.10)'; border = 'rgba(77,255,145,0.4)'; textColor = T.green
      icon = <CheckCircle2 size={15} style={{ marginLeft: 'auto', flexShrink: 0, color: T.green }} />
    } else if (selected) {
      bg = 'rgba(255,107,157,0.10)'; border = 'rgba(255,107,157,0.4)'; textColor = T.pink
      icon = <XCircle size={15} style={{ marginLeft: 'auto', flexShrink: 0, color: T.pink }} />
    }
  } else if (selected) {
    bg = 'rgba(196,77,255,0.12)'; border = 'rgba(196,77,255,0.45)'; textColor = T.purple
  }

  return (
    <motion.button
      whileHover={!revealed ? { x: 4 } : {}}
      whileTap={!revealed ? { scale: 0.98 } : {}}
      onClick={!revealed ? onClick : undefined}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: 10,
        background: bg, border: `1px solid ${border}`,
        color: textColor, cursor: revealed ? 'default' : 'pointer',
        fontFamily: "'Manrope', sans-serif", fontSize: 14,
        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
        boxSizing: 'border-box',
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        background: (selected || (revealed && correct)) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: textColor,
      }}>
        {['A', 'B', 'C', 'D'][index]}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {icon}
    </motion.button>
  )
}

export default function Quiz() {
  const { notes } = useNotesStore()
  const [screen, setScreen] = useState('setup') // setup | playing | results
  const [source, setSource] = useState('note') // note | text
  const [selectedNoteId, setSelectedNoteId] = useState('')
  const [customText, setCustomText] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history] = useState(loadHistory)

  const hasKey = hasClientKey()

  const startQuiz = async () => {
    setError('')
    const text = source === 'note'
      ? notes.find(n => n.id === selectedNoteId)?.content || ''
      : customText
    if (!text.trim()) { setError('No content to quiz on.'); return }
    if (!hasKey) { setError('Add your Gemini API key in Settings first.'); return }
    setLoading(true)
    const qs = await generateQuiz(text, questionCount)
    setLoading(false)
    if (!qs) { setError("Gemini couldn't parse the quiz. Try different content."); return }
    setQuestions(qs)
    setAnswers([])
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScreen('playing')
  }

  const confirm = useCallback(() => {
    if (selected === null || revealed) return
    setRevealed(true)
    setAnswers(prev => [...prev, {
      questionIndex: current,
      selected,
      correct: questions[current].correct,
    }])
  }, [selected, revealed, current, questions])

  const next = useCallback(() => {
    if (current + 1 >= questions.length) {
      saveHistory({
        date: Date.now(),
        score: answers.filter(a => a.selected === a.correct).length + (selected === questions[current].correct ? 1 : 0),
        total: questions.length,
        title: source === 'note'
          ? (notes.find(n => n.id === selectedNoteId)?.title || 'Custom')
          : 'Custom Text',
      })
      setScreen('results')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }, [current, questions, answers, selected, source, notes, selectedNoteId])

  useEffect(() => {
    const handler = (e) => {
      if (screen !== 'playing') return
      if (!revealed && ['1','2','3','4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < questions[current]?.options?.length) setSelected(idx)
      }
      if (e.key === 'Enter') {
        if (!revealed && selected !== null) confirm()
        else if (revealed) next()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen, revealed, selected, current, questions, confirm, next])

  const score = answers.filter(a => a.selected === a.correct).length
  const q = questions[current]

  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(196,77,255,0.25), rgba(82,141,255,0.2))',
            border: '1px solid rgba(196,77,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={18} style={{ color: T.purple }} />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 22, color: T.text, margin: 0,
          }}>AI Quiz</h1>
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, margin: 0 }}>
          Generate a quiz from your notes or any text. Press 1–4 to answer, Enter to confirm.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* SETUP */}
        {screen === 'setup' && !loading && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ ...card, marginBottom: 16 }}>
              {/* Source tabs */}
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                fontSize: 11, color: T.muted, letterSpacing: '0.08em',
                marginBottom: 12, textTransform: 'uppercase',
              }}>Quiz Source</div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[
                  { id: 'note', label: 'From a Note', icon: FileText },
                  { id: 'text', label: 'Paste Text', icon: Type },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSource(id)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8,
                      background: source === id ? 'rgba(196,77,255,0.14)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${source === id ? 'rgba(196,77,255,0.45)' : T.border}`,
                      color: source === id ? T.purple : T.muted,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: 8, fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {source === 'note' ? (
                <select
                  value={selectedNoteId}
                  onChange={e => setSelectedNoteId(e.target.value)}
                  style={{ ...inputStyle, background: 'rgba(255,255,255,0.04)' }}
                >
                  <option value="">— Select a note —</option>
                  {notes.map(n => (
                    <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
                  ))}
                </select>
              ) : (
                <textarea
                  rows={6}
                  placeholder="Paste your study material here..."
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              )}

              {/* Question count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                  fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>Questions</span>
                {[5, 8, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    style={{
                      padding: '6px 16px', borderRadius: 8,
                      background: questionCount === n ? 'rgba(82,141,255,0.14)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${questionCount === n ? 'rgba(82,141,255,0.45)' : T.border}`,
                      color: questionCount === n ? T.blue : T.muted,
                      cursor: 'pointer',
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >{n}</button>
                ))}
              </div>

              {error && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,107,157,0.08)',
                  border: '1px solid rgba(255,107,157,0.3)',
                  color: T.pink, display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {!hasKey && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,214,160,0.06)',
                  border: '1px solid rgba(255,214,160,0.2)',
                  color: T.orange,
                  fontFamily: "'Manrope', sans-serif", fontSize: 12,
                }}>
                  No Gemini key set. Add one in Settings → Gemini API Key.
                </div>
              )}

              <button
                onClick={startQuiz}
                disabled={loading}
                style={{ ...primaryBtn, marginTop: 20, width: '100%', justifyContent: 'center', padding: '12px 20px' }}
              >
                <Sparkles size={15} /> Generate Quiz
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={card}
              >
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                  fontSize: 11, color: T.muted, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 14,
                }}>Recent Quizzes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.slice(0, 5).map((h, i) => {
                    const pct = Math.round((h.score / h.total) * 100)
                    const { letter, color } = getGrade(pct)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 9,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.text, fontWeight: 600 }}>
                            {h.title}
                          </div>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.faint, marginTop: 2 }}>
                            {new Date(h.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                            fontSize: 13, color,
                          }}>{pct}%</span>
                          <span style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: `${color}15`, border: `1px solid ${color}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                            fontSize: 12, color,
                          }}>{letter}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* LOADING */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...card, textAlign: 'center', padding: '60px 24px' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '3px solid rgba(196,77,255,0.15)',
              borderTop: '3px solid #c44dff',
              animation: 'spin 0.9s linear infinite',
              margin: '0 auto 20px',
            }} />
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 15, color: T.text, marginBottom: 6,
            }}>Generating quiz…</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
              Gemini is crafting {questionCount} questions from your material
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {screen === 'playing' && q && !loading && (
          <motion.div
            key={`q-${current}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                  fontSize: 12, color: T.muted,
                }}>Question {current + 1} of {questions.length}</span>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                  fontSize: 12, color: T.green,
                }}>{score} correct</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(50,55,70,0.5)' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #528dff, #c44dff)' }}
                  initial={{ width: `${(current / questions.length) * 100}%` }}
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <div style={{ ...card, marginBottom: 14 }}>
              {/* Question text */}
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18, fontWeight: 700, color: T.text,
                lineHeight: 1.55, marginBottom: 22,
              }}>
                {q.question}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, i) => (
                  <OptionBtn
                    key={i}
                    index={i}
                    label={opt}
                    selected={selected === i}
                    correct={revealed && i === q.correct}
                    revealed={revealed}
                    onClick={() => setSelected(i)}
                  />
                ))}
              </div>

              {/* Explanation */}
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16, padding: '12px 14px', borderRadius: 9,
                    background: 'rgba(82,141,255,0.07)',
                    border: '1px solid rgba(82,141,255,0.18)',
                  }}
                >
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: 13,
                    color: T.blue, lineHeight: 1.6,
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!revealed ? (
                <button
                  onClick={confirm}
                  disabled={selected === null}
                  style={{
                    ...primaryBtn,
                    flex: 1, justifyContent: 'center', padding: '12px 20px',
                    opacity: selected === null ? 0.45 : 1,
                  }}
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={next}
                  style={{ ...primaryBtn, flex: 1, justifyContent: 'center', padding: '12px 20px' }}
                >
                  {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
            <p style={{
              textAlign: 'center', marginTop: 10,
              fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.faint,
            }}>Press 1–4 to select · Enter to confirm / next</p>
          </motion.div>
        )}

        {/* RESULTS */}
        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ ...card, textAlign: 'center', padding: '40px 32px' }}>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                  <Trophy size={22} style={{ color: T.orange }} />
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                    fontSize: 20, color: T.text,
                  }}>Quiz Complete</span>
                </div>
              </motion.div>

              <ScoreRing score={score} total={questions.length} />

              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14, color: T.muted, margin: '24px 0',
                lineHeight: 1.6,
              }}>
                {score >= questions.length * 0.8
                  ? "Excellent work! You've mastered this material."
                  : score >= questions.length * 0.6
                    ? "Good effort! Review the questions you missed."
                    : "Keep studying — try again after reviewing your notes."}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  onClick={() => {
                    setAnswers([])
                    setCurrent(0)
                    setSelected(null)
                    setRevealed(false)
                    setScreen('playing')
                  }}
                  style={{ ...secondaryBtn, padding: '10px 20px' }}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={() => {
                    setQuestions([])
                    setAnswers([])
                    setCurrent(0)
                    setSelected(null)
                    setRevealed(false)
                    setScreen('setup')
                  }}
                  style={{ ...primaryBtn, padding: '10px 20px' }}
                >
                  <Sparkles size={14} /> New Quiz
                </button>
              </div>

              <button
                onClick={() => {
                  const pct = Math.round((score / questions.length) * 100)
                  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '📚' : '💪'
                  const text = `${emoji} Just scored ${pct}% on an AI-generated quiz from my study notes!\n\nUsing Shiori — free AI study companion for students.\nTry it: https://shiorii.tech\n\n#Shiori #StudyWithAI #OpenSource`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '7px 16px', borderRadius: 8,
                  background: 'rgba(29,161,242,0.10)',
                  border: '1px solid rgba(29,161,242,0.25)',
                  color: '#1da1f2', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12, fontWeight: 600,
                }}
              >
                <Share2 size={13} /> Share Score on X
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
