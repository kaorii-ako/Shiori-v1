import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Sparkles, CheckCircle2, XCircle, RefreshCw,
  Trophy, ChevronRight, FileText, Type, AlertCircle, Share2,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { useNotesStore, useUIStore } from '../stores'
import { callGeminiClient, hasClientKey } from '../utils/gemini'

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

const ScoreRing = ({ score, total }) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  const color = pct >= 80 ? '#4dff91' : pct >= 60 ? '#ffd6a0' : '#ff6b9d'
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r="52" fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 52}
          initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 22, color,
        }}>{pct}%</span>
        <span style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 11, color: '#8c90a0', marginTop: 2,
        }}>{score}/{total}</span>
      </div>
    </div>
  )
}

const OptionBtn = ({ label, selected, correct, revealed, onClick, index }) => {
  let bg = 'rgba(24,28,34,0.6)'
  let border = 'rgba(66,71,84,0.35)'
  let textColor = '#c4c8d4'
  if (revealed) {
    if (correct) { bg = 'rgba(77,255,145,0.12)'; border = 'rgba(77,255,145,0.5)'; textColor = '#4dff91' }
    else if (selected) { bg = 'rgba(255,107,157,0.12)'; border = 'rgba(255,107,157,0.5)'; textColor = '#ff6b9d' }
  } else if (selected) {
    bg = 'rgba(196,77,255,0.12)'; border = 'rgba(196,77,255,0.5)'; textColor = '#e5b5ff'
  }

  return (
    <motion.button
      whileHover={!revealed ? { translateX: 4 } : {}}
      whileTap={!revealed ? { scale: 0.98 } : {}}
      onClick={!revealed ? onClick : undefined}
      style={{
        width: '100%', padding: '13px 16px', borderRadius: 10,
        background: bg, border: `1px solid ${border}`,
        color: textColor, cursor: revealed ? 'default' : 'pointer',
        fontFamily: "'Manrope', sans-serif", fontSize: 14,
        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}
    >
      <span style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: selected || (revealed && correct) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700,
      }}>
        {['1', '2', '3', '4'][index]}
      </span>
      {label}
      {revealed && correct && <CheckCircle2 size={15} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
      {revealed && selected && !correct && <XCircle size={15} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
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
    if (!qs) { setError('Gemini couldn\'t parse the quiz. Try different content.'); return }
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
      const score = answers.filter(a => a.selected === a.correct).length +
        (selected === questions[current]?.correct ? 1 : 0)
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
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 18, color: '#dfe2eb', marginBottom: 6,
        }}>AI QUIZ</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0' }}>
          Generate a quiz from your notes or any text. Press 1–4 to answer, Enter to confirm.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* SETUP */}
        {screen === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <GlassCard style={{ padding: 24, marginBottom: 20 }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13, fontWeight: 600, color: '#8c90a0',
                marginBottom: 16, letterSpacing: '0.06em',
              }}>QUIZ SOURCE</div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[
                  { id: 'note', label: 'From a Note', icon: FileText },
                  { id: 'text', label: 'Paste Text', icon: Type },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSource(id)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8,
                      background: source === id ? 'rgba(196,77,255,0.15)' : 'rgba(24,28,34,0.6)',
                      border: `1px solid ${source === id ? 'rgba(196,77,255,0.5)' : 'rgba(66,71,84,0.35)'}`,
                      color: source === id ? '#e5b5ff' : '#8c90a0',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: 8, fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              {source === 'note' ? (
                <select
                  value={selectedNoteId}
                  onChange={e => setSelectedNoteId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(24,28,34,0.8)',
                    border: '1px solid rgba(66,71,84,0.40)',
                    color: '#dfe2eb', outline: 'none',
                    fontFamily: "'Manrope', sans-serif", fontSize: 14,
                  }}
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
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(24,28,34,0.8)',
                    border: '1px solid rgba(66,71,84,0.40)',
                    color: '#dfe2eb', outline: 'none', resize: 'vertical',
                    fontFamily: "'Manrope', sans-serif", fontSize: 14,
                    lineHeight: 1.6,
                  }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, color: '#8c90a0', fontWeight: 600,
                }}>QUESTIONS</div>
                {[5, 8, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    style={{
                      padding: '6px 14px', borderRadius: 6,
                      background: questionCount === n ? 'rgba(82,141,255,0.15)' : 'rgba(24,28,34,0.6)',
                      border: `1px solid ${questionCount === n ? 'rgba(82,141,255,0.5)' : 'rgba(66,71,84,0.35)'}`,
                      color: questionCount === n ? '#afc6ff' : '#8c90a0',
                      cursor: 'pointer',
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
                    }}
                  >{n}</button>
                ))}
              </div>

              {error && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,107,157,0.1)',
                  border: '1px solid rgba(255,107,157,0.3)',
                  color: '#ff6b9d', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {!hasKey && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,170,77,0.08)',
                  border: '1px solid rgba(255,170,77,0.25)',
                  color: '#ffd6a0',
                  fontFamily: "'Manrope', sans-serif", fontSize: 12,
                }}>
                  No Gemini key set. Add one in Settings → Gemini API Key.
                </div>
              )}

              <Button
                onClick={startQuiz}
                disabled={loading}
                style={{ marginTop: 20, width: '100%' }}
              >
                {loading ? (
                  <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                ) : (
                  <><Sparkles size={15} /> Generate Quiz</>
                )}
              </Button>
            </GlassCard>

            {/* History */}
            {history.length > 0 && (
              <GlassCard style={{ padding: 20 }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12, fontWeight: 600, color: '#8c90a0',
                  letterSpacing: '0.06em', marginBottom: 14,
                }}>RECENT QUIZZES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {history.slice(0, 5).map((h, i) => {
                    const pct = Math.round((h.score / h.total) * 100)
                    const c = pct >= 80 ? '#4dff91' : pct >= 60 ? '#ffd6a0' : '#ff6b9d'
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(24,28,34,0.5)',
                        border: '1px solid rgba(66,71,84,0.25)',
                      }}>
                        <div>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#dfe2eb' }}>
                            {h.title}
                          </div>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080' }}>
                            {new Date(h.date).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: 13, color: c,
                        }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {/* PLAYING */}
        {screen === 'playing' && q && (
          <motion.div
            key={`q-${current}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12, color: '#8c90a0', fontWeight: 600,
                }}>QUESTION {current + 1} / {questions.length}</span>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12, color: '#4dff91', fontWeight: 600,
                }}>{score} correct</span>
              </div>
              <div style={{
                height: 4, borderRadius: 2, background: 'rgba(66,71,84,0.40)',
              }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #528dff, #c44dff)' }}
                  initial={{ width: `${(current / questions.length) * 100}%` }}
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <GlassCard style={{ padding: 24, marginBottom: 16 }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16, fontWeight: 700, color: '#dfe2eb',
                lineHeight: 1.5, marginBottom: 24,
              }}>
                {q.question}
              </div>
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

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16, padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(82,141,255,0.08)',
                    border: '1px solid rgba(82,141,255,0.20)',
                  }}
                >
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: 13,
                    color: '#afc6ff', lineHeight: 1.6,
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </motion.div>
              )}
            </GlassCard>

            <div style={{ display: 'flex', gap: 10 }}>
              {!revealed ? (
                <Button
                  onClick={confirm}
                  disabled={selected === null}
                  style={{ flex: 1 }}
                >
                  Confirm Answer
                </Button>
              ) : (
                <Button onClick={next} style={{ flex: 1 }}>
                  {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
            <p style={{
              textAlign: 'center', marginTop: 10,
              fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#424558',
            }}>Press 1–4 to select · Enter to confirm / next</p>
          </motion.div>
        )}

        {/* RESULTS */}
        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard style={{ padding: 32, textAlign: 'center' }}>
              <Trophy size={32} style={{ color: '#ffd6a0', margin: '0 auto 20px' }} />
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 16, color: '#dfe2eb', marginBottom: 24,
              }}>QUIZ DONE</div>

              <ScoreRing score={score} total={questions.length} />

              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14, color: '#8c90a0', margin: '24px 0',
              }}>
                {score >= questions.length * 0.8
                  ? "Excellent work! You've mastered this material."
                  : score >= questions.length * 0.6
                    ? "Good effort! Review the questions you missed."
                    : "Keep studying — try again after reviewing your notes."}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={() => {
                  setQuestions([])
                  setAnswers([])
                  setCurrent(0)
                  setSelected(null)
                  setRevealed(false)
                  setScreen('setup')
                }}>
                  <RefreshCw size={15} /> New Quiz
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAnswers([])
                    setCurrent(0)
                    setSelected(null)
                    setRevealed(false)
                    setScreen('playing')
                  }}
                >
                  Retry Same Quiz
                </Button>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    const pct = Math.round((score / questions.length) * 100)
                    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '📚' : '💪'
                    const text = `${emoji} Just scored ${pct}% on an AI-generated quiz from my study notes!\n\nUsing Shiori — free AI study companion for students.\nTry it: https://shiori-v1.vercel.app\n\n#Shiori #StudyWithAI #OpenSource`
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 18px', borderRadius: 8,
                    background: 'rgba(29,161,242,0.12)',
                    border: '1px solid rgba(29,161,242,0.30)',
                    color: '#1da1f2', cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  <Share2 size={14} /> Share Score on X
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
