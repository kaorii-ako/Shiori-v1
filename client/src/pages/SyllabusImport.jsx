import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Sparkles, CheckCircle2, AlertCircle,
  Plus, Trash2, RefreshCw, BookOpen, ArrowRight,
  Calendar, Clock, Tag,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { useAssignmentsStore } from '../stores'
import { callGeminiClient, hasClientKey } from '../utils/gemini'
import { useNavigate } from 'react-router-dom'

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

    // Create course if it doesn't exist
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

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 16, color: '#dfe2eb', marginBottom: 6,
        }}>SYLLABUS IMPORT</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0' }}>
          Paste your course syllabus — Gemini extracts every assignment and due date in seconds.
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'paste', label: 'Paste' },
          { key: 'preview', label: 'Review' },
          { key: 'done', label: 'Done' },
        ].map(({ key, label }, i) => {
          const active = step === key
          const done = (step === 'preview' && key === 'paste') || (step === 'done' && key !== 'done')
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: done ? '#4dff91' : active ? 'rgba(196,77,255,0.3)' : 'rgba(66,71,84,0.4)',
                border: `2px solid ${done ? '#4dff91' : active ? '#c44dff' : 'rgba(66,71,84,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                color: done ? '#10141a' : active ? '#e5b5ff' : '#606080',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                fontWeight: 600, color: active ? '#dfe2eb' : '#606080',
              }}>{label}</span>
              {i < 2 && <div style={{ width: 24, height: 1, background: 'rgba(66,71,84,0.4)' }} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1: PASTE */}
        {step === 'paste' && (
          <motion.div key="paste" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard style={{ padding: 24 }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12, fontWeight: 700, color: '#8c90a0',
                letterSpacing: '0.06em', marginBottom: 12,
              }}>PASTE SYLLABUS TEXT</div>

              <textarea
                rows={14}
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                placeholder={`Paste your full course syllabus here.\n\nTips for best results:\n• Copy-paste from PDF viewer (Ctrl+A, Ctrl+C)\n• Or from your Canvas/Blackboard course page\n• Gemini works best with plain text — tables and lists are fine\n\nExample of what works:\n"Assignment 1: Literature Review — Due Sep 15, 20pts\nMidterm Exam — Oct 10, in-class, 100pts\nFinal Project — Dec 5, 150pts\nWeekly quizzes every Friday, 10pts each"`}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 8,
                  background: 'rgba(24,28,34,0.8)',
                  border: '1px solid rgba(66,71,84,0.40)',
                  color: '#dfe2eb', outline: 'none', resize: 'vertical',
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                  lineHeight: 1.6, boxSizing: 'border-box',
                }}
              />

              <div style={{
                marginTop: 8, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#424558' }}>
                  {text.length > 0 ? `${text.length} characters` : 'Supports English and Thai syllabuses'}
                </span>
                {!hasClientKey() && (
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#ffd6a0' }}>
                    ⚠ Add Gemini API key in Settings first
                  </span>
                )}
              </div>

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,107,157,0.1)',
                  border: '1px solid rgba(255,107,157,0.3)',
                  color: '#ff6b9d', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <Button
                onClick={parse}
                disabled={parsing || !text.trim()}
                style={{ marginTop: 16, width: '100%' }}
              >
                {parsing
                  ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Parsing syllabus…</>
                  : <><Sparkles size={15} /> Extract Assignments with AI</>
                }
              </Button>
            </GlassCard>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </motion.div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && parsed && (
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <BookOpen size={18} style={{ color: '#afc6ff' }} />
                <div>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 16, color: '#dfe2eb',
                  }}>{parsed.courseName || 'Imported Course'}</div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0' }}>
                    {items.filter(i => i.selected).length} of {items.length} assignments selected
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: true })))}
                    style={{
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(77,255,145,0.1)', border: '1px solid rgba(77,255,145,0.3)',
                      color: '#4dff91', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                    }}
                  >Select all</button>
                  <button
                    onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: false })))}
                    style={{
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(66,71,84,0.3)', border: '1px solid rgba(66,71,84,0.4)',
                      color: '#8c90a0', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                    }}
                  >None</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 12px', borderRadius: 8,
                      background: item.selected ? 'rgba(24,28,34,0.7)' : 'rgba(24,28,34,0.3)',
                      border: `1px solid ${item.selected ? 'rgba(82,141,255,0.25)' : 'rgba(66,71,84,0.20)'}`,
                      opacity: item.selected ? 1 : 0.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      background: item.selected ? '#528dff' : 'rgba(66,71,84,0.4)',
                      border: `2px solid ${item.selected ? '#528dff' : 'rgba(66,71,84,0.4)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.selected && <CheckCircle2 size={11} color="#fff" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600, fontSize: 13, color: '#dfe2eb',
                        marginBottom: 3,
                      }}>{item.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {item.dueDate && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#8c90a0',
                          }}>
                            <Calendar size={10} />
                            {new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span style={{
                          padding: '1px 6px', borderRadius: 4, fontSize: 10,
                          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                          background: `${PRIORITY_COLORS[item.priority] || '#afc6ff'}20`,
                          color: PRIORITY_COLORS[item.priority] || '#afc6ff',
                        }}>{item.priority?.toUpperCase()}</span>
                        {item.category && (
                          <span style={{
                            fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080',
                          }}>{item.category}</span>
                        )}
                        {item.points && (
                          <span style={{
                            fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080',
                          }}>{item.points} pts</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#606080', padding: 2, flexShrink: 0,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                onClick={doImport}
                disabled={importing || items.filter(i => i.selected).length === 0}
                style={{ flex: 1 }}
              >
                <Plus size={15} />
                Import {items.filter(i => i.selected).length} Assignment{items.filter(i => i.selected).length !== 1 ? 's' : ''}
              </Button>
              <Button variant="secondary" onClick={() => { setStep('paste'); setParsed(null); setItems([]) }}>
                Re-paste
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DONE */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard style={{ padding: 40, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                style={{ marginBottom: 20 }}
              >
                <CheckCircle2 size={48} style={{ color: '#4dff91', margin: '0 auto' }} />
              </motion.div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 16, color: '#4dff91', marginBottom: 16,
              }}>IMPORTED!</div>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 15, color: '#8c90a0', marginBottom: 32, lineHeight: 1.6,
              }}>
                {importCount} assignment{importCount !== 1 ? 's' : ''} added to <strong style={{ color: '#dfe2eb' }}>{parsed?.courseName}</strong>.
                They're now in your Assignments list, Calendar, and Home dashboard.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={() => navigate('/assignments')}>
                  View Assignments <ArrowRight size={15} />
                </Button>
                <Button variant="secondary" onClick={() => {
                  setText(''); setParsed(null); setItems([]); setImportCount(0); setStep('paste')
                }}>
                  Import Another
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
