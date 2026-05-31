import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Sparkles, CheckCircle2, AlertCircle,
  Plus, Trash2, RefreshCw, BookOpen, ArrowRight,
  Calendar, Clock, Tag,
} from 'lucide-react'
import { useAssignmentsStore } from '../stores'
import { callGeminiClient, hasClientKey } from '../utils/gemini'
import { useNavigate } from 'react-router-dom'

const T = {
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

const PRIORITY_COLORS = { high: '#ff6b9d', medium: '#ffd6a0', low: '#4dff91' }
const COURSE_COLORS = ['#afc6ff', '#c44dff', '#4dff91', '#ff6b9d', '#ffd6a0', '#4daaff', '#e5b5ff', '#80ffd4']

async function parseSyllabus(text) {
  const prompt = `You are a student assistant. Extract ALL assignments, deadlines, and graded items from this course syllabus.

SYLLABUS:
${text.slice(0, 4000)}

Return ONLY valid JSON (no markdown), in this exact format:
{
  "courseName": "Course name from the syllabus",
  "assignments": [
    {
      "title": "Assignment name",
      "dueDate": "YYYY-MM-DD",
      "points": 100,
      "category": "Homework|Quiz|Exam|Project|Lab|Essay|Other",
      "description": "Brief description (max 80 chars)",
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- If no year is given, use the current year (${new Date().getFullYear()}) or next year if month has passed
- "priority" is "high" for exams/finals, "medium" for projects/essays, "low" for homework/quizzes
- If points are not mentioned, estimate based on type (Final=200, Midterm=150, Project=100, Quiz=50, HW=20)
- Include ALL graded items even if date is vague (use end of semester if unclear)
- Return an empty assignments array if nothing is found`

  const raw = await callGeminiClient(prompt)
  if (!raw) return null
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed.assignments) return null
    return parsed
  } catch { return null }
}

export default function SyllabusImport() {
  const { addAssignment, setCourses, courses } = useAssignmentsStore()
  const navigate = useNavigate()

  const [step, setStep] = useState('paste') // paste | preview | done
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)
  const [items, setItems] = useState([])
  const [importing, setImporting] = useState(false)
  const [importCount, setImportCount] = useState(0)

  const parse = async () => {
    setError('')
    if (!text.trim()) { setError('Paste your syllabus text first.'); return }
    if (!hasClientKey()) { setError('Add your Gemini API key in Settings first.'); return }
    setParsing(true)
    const result = await parseSyllabus(text)
    setParsing(false)
    if (!result) {
      setError("Couldn't parse the syllabus. Try pasting a cleaner version — plain text works best.")
      return
    }
    setParsed(result)
    setItems(result.assignments.map((a, i) => ({ ...a, id: `import-${Date.now()}-${i}`, selected: true })))
    setStep('preview')
  }

  const toggleItem = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i))
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const doImport = () => {
    setImporting(true)
    const selected = items.filter(i => i.selected)

    let courseId = courses.find(c =>
      c.name?.toLowerCase() === parsed.courseName?.toLowerCase()
    )?.id

    if (!courseId) {
      courseId = `course-import-${Date.now()}`
      const color = COURSE_COLORS[courses.length % COURSE_COLORS.length]
      setCourses([...courses, { id: courseId, name: parsed.courseName || 'Imported Course', color }])
    }

    selected.forEach(item => {
      addAssignment({
        id: item.id,
        title: item.title,
        courseId,
        dueDate: item.dueDate,
        description: item.description || '',
        priority: item.priority || 'medium',
        status: 'pending',
        points: item.points || null,
        category: item.category || 'Other',
        estimatedHours: item.category === 'Exam' ? 4 : item.category === 'Project' ? 6 : 1,
        createdAt: Date.now(),
      })
    })

    setImportCount(selected.length)
    setImporting(false)
    setStep('done')
  }

  const STEPS = [
    { key: 'paste', label: 'Paste Syllabus' },
    { key: 'preview', label: 'Review Assignments' },
    { key: 'done', label: 'Done' },
  ]
  const stepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
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
            background: 'linear-gradient(135deg, rgba(82,141,255,0.25), rgba(196,77,255,0.2))',
            border: '1px solid rgba(82,141,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={18} style={{ color: T.blue }} />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 22, color: T.text, margin: 0,
          }}>Import Syllabus</h1>
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, margin: 0 }}>
          Paste your course syllabus — Gemini extracts every assignment and due date in seconds.
        </p>
      </motion.div>

      {/* Step indicators */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}
      >
        {STEPS.map(({ key, label }, i) => {
          const active = step === key
          const done = i < stepIndex
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? T.green : active ? 'rgba(196,77,255,0.25)' : 'rgba(50,55,70,0.4)',
                  border: `2px solid ${done ? T.green : active ? '#c44dff' : 'rgba(50,55,70,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                  fontSize: done ? 13 : 12,
                  color: done ? '#0a0d12' : active ? T.purple : T.faint,
                  transition: 'all 0.3s',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                  fontWeight: 600, color: active ? T.text : done ? T.muted : T.faint,
                  whiteSpace: 'nowrap',
                }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1, margin: '0 12px',
                  background: done ? `${T.green}60` : 'rgba(50,55,70,0.4)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* STEP 1: PASTE */}
        {step === 'paste' && (
          <motion.div key="paste" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div style={card}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                fontSize: 11, color: T.muted, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 14,
              }}>Paste Syllabus Text</div>

              <textarea
                rows={14}
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                placeholder={`Paste your full course syllabus here.\n\nTips for best results:\n• Copy-paste from PDF viewer (Ctrl+A, Ctrl+C)\n• Or from your Canvas/Blackboard course page\n• Gemini works best with plain text — tables and lists are fine\n\nExample:\n"Assignment 1: Literature Review — Due Sep 15, 20pts\nMidterm Exam — Oct 10, in-class, 100pts\nFinal Project — Dec 5, 150pts"`}
                style={{
                  ...inputStyle,
                  resize: 'vertical', lineHeight: 1.6,
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: 13, minHeight: 240,
                }}
              />

              <div style={{
                marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.faint }}>
                  {text.length > 0 ? `${text.length.toLocaleString()} characters` : 'Supports English and Thai syllabuses'}
                </span>
                {!hasClientKey() && (
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.orange }}>
                    ⚠ Add Gemini API key in Settings first
                  </span>
                )}
              </div>

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,107,157,0.07)',
                  border: '1px solid rgba(255,107,157,0.28)',
                  color: T.pink, display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <button
                onClick={parse}
                disabled={parsing || !text.trim()}
                style={{
                  ...primaryBtn,
                  marginTop: 16, width: '100%', justifyContent: 'center', padding: '12px 20px',
                  opacity: (parsing || !text.trim()) ? 0.5 : 1,
                }}
              >
                {parsing
                  ? <><span style={{ animation: 'spin 0.9s linear infinite', display: 'inline-flex' }}><RefreshCw size={15} /></span> Parsing syllabus…</>
                  : <><Sparkles size={15} /> Extract Assignments with AI</>
                }
              </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </motion.div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && parsed && (
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ ...card, marginBottom: 14 }}>
              {/* Course header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(82,141,255,0.15)',
                  border: '1px solid rgba(82,141,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={18} style={{ color: T.blue }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 16, color: T.text,
                  }}>{parsed.courseName || 'Imported Course'}</div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {items.filter(i => i.selected).length} of {items.length} assignments selected
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: true })))}
                    style={{
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(77,255,145,0.08)',
                      border: '1px solid rgba(77,255,145,0.25)',
                      color: T.green,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                    }}
                  >Select all</button>
                  <button
                    onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: false })))}
                    style={{
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(50,55,70,0.3)',
                      border: '1px solid rgba(50,55,70,0.4)',
                      color: T.muted,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                    }}
                  >None</button>
                </div>
              </div>

              {/* Assignment list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', borderRadius: 9,
                      background: item.selected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${item.selected ? 'rgba(82,141,255,0.22)' : 'rgba(50,55,70,0.25)'}`,
                      opacity: item.selected ? 1 : 0.5,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s, border-color 0.2s',
                    }}
                    onClick={() => toggleItem(item.id)}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
                      background: item.selected ? T.blueVibrant : 'rgba(50,55,70,0.4)',
                      border: `2px solid ${item.selected ? T.blueVibrant : 'rgba(50,55,70,0.4)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {item.selected && <CheckCircle2 size={11} color="#fff" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600, fontSize: 13, color: T.text, marginBottom: 5,
                      }}>{item.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {item.dueDate && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted,
                          }}>
                            <Calendar size={10} />
                            {new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span style={{
                          padding: '2px 7px', borderRadius: 5, fontSize: 10,
                          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                          background: `${PRIORITY_COLORS[item.priority] || T.blue}18`,
                          color: PRIORITY_COLORS[item.priority] || T.blue,
                          letterSpacing: '0.06em',
                        }}>{item.priority?.toUpperCase()}</span>
                        {item.category && (
                          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.faint }}>
                            {item.category}
                          </span>
                        )}
                        {item.points && (
                          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.faint }}>
                            {item.points} pts
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: T.faint, padding: 2, flexShrink: 0,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={doImport}
                disabled={importing || items.filter(i => i.selected).length === 0}
                style={{
                  ...primaryBtn, flex: 1, justifyContent: 'center', padding: '12px 20px',
                  opacity: (importing || items.filter(i => i.selected).length === 0) ? 0.45 : 1,
                }}
              >
                <Plus size={15} />
                Import {items.filter(i => i.selected).length} Assignment{items.filter(i => i.selected).length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => { setStep('paste'); setParsed(null); setItems([]) }}
                style={secondaryBtn}
              >
                Re-paste
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DONE */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ ...card, textAlign: 'center', padding: '48px 32px' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                style={{ marginBottom: 20 }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(77,255,145,0.12)',
                  border: '2px solid rgba(77,255,145,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <CheckCircle2 size={36} style={{ color: T.green }} />
                </div>
              </motion.div>

              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: 22, color: T.green, marginBottom: 12,
              }}>Imported!</div>

              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 15, color: T.muted, marginBottom: 32, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 32px',
              }}>
                <strong style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>
                  {importCount}
                </strong>{' '}
                assignment{importCount !== 1 ? 's' : ''} added to{' '}
                <strong style={{ color: T.text }}>{parsed?.courseName}</strong>.
                They're now in your Assignments list, Calendar, and Home dashboard.
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/assignments')} style={{ ...primaryBtn, padding: '11px 24px' }}>
                  View Assignments <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => { setText(''); setParsed(null); setItems([]); setImportCount(0); setStep('paste') }}
                  style={{ ...secondaryBtn, padding: '11px 20px' }}
                >
                  Import Another
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
