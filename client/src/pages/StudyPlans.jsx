import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Calendar,
  Brain,
  AlertTriangle,
  Download,
  GripVertical,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAssignmentsStore, useAuthStore } from '../stores'
import { ai } from '../lib/api'
import { exportStudyPlanToPDF } from '../utils/pdfExport'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  border: 'rgba(50,55,70,0.4)',
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

const COURSE_COLORS = {
  'course-1': '#ff6b9d',
  'course-2': '#c44dff',
  'course-3': '#4daaff',
  'course-4': '#4dff91',
  'course-5': '#ffd6a0',
}

const buildSessionsFromAssignments = (assignments) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessions = []

  const pending = assignments
    .filter(a => a.status !== 'graded' && a.status !== 'completed' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (pending.length === 0) return []

  const daySlots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { date: d, sessions: [] }
  })

  pending.forEach((assignment, idx) => {
    const slotIdx = idx % 7
    const slot = daySlots[slotIdx]
    slot.sessions.push({
      id: `session-${assignment.id}-${idx}`,
      title: `Study: ${assignment.title}`,
      courseName: assignment.courseName || 'General',
      courseId: assignment.courseId || 'course-1',
      duration: assignment.priority === 'high' ? 90 : 60,
      date: slot.date.toISOString(),
      completed: false,
      priority: assignment.priority || 'medium',
    })
  })

  return daySlots.flatMap(slot => slot.sessions)
}

const StudyPlans = () => {
  const { assignments } = useAssignmentsStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [aiInsight, setAiInsight] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  useEffect(() => {
    if (user?.isDemo && assignments.length > 0 && sessions.length === 0 && !generated) {
      const built = buildSessionsFromAssignments(assignments)
      setSessions(built)
      const highPriority = assignments.filter(a => a.priority === 'high' && a.status !== 'graded' && a.status !== 'completed')
      const totalHours = built.reduce((s, ss) => s + ss.duration, 0) / 60
      setAiInsight(`${highPriority.length > 0 ? `${highPriority.length} high-priority tasks detected.` : ''} I've scheduled ${built.length} sessions (${totalHours.toFixed(1)}h total) and front-loaded your most urgent assignments. Tackle heavy sessions in the morning when focus peaks — check off each one as you go!`)
      setGenerated(true)
    }
  }, [user, assignments, sessions.length, generated])

  const generateStudyPlan = async () => {
    setLoading(true)
    try {
      const response = await ai.generateStudyPlan(assignments, { daysPerWeek: 5, hoursPerDay: 3 })
      const data = response.data
      if (data?.sessions?.length > 0) {
        setSessions(data.sessions)
      } else {
        setSessions(buildSessionsFromAssignments(assignments))
      }
      if (data?.insight) setAiInsight(data.insight)
    } catch {
      setSessions(buildSessionsFromAssignments(assignments))
    } finally {
      setLoading(false)
      setGenerated(true)
    }
  }

  const toggleSession = (sessionId) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, completed: !s.completed } : s)
    )
  }

  const handleDragStart = (e, id) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== draggedId) setDragOverId(id)
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    setSessions(prev => {
      const arr = [...prev]
      const fromIdx = arr.findIndex(s => s.id === draggedId)
      const toIdx = arr.findIndex(s => s.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [item] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, item)
      return arr
    })
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const groupSessionsByDate = () => {
    const grouped = {}
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(session)
    })
    return grouped
  }

  const groupedSessions = groupSessionsByDate()
  const completedCount = sessions.filter(s => s.completed).length
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
  const today = new Date()

  const priorityColor = {
    high: T.pink,
    medium: T.orange,
    low: T.green,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: T.text, letterSpacing: '-0.02em' }}>
            Study Plans
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 4 }}>
            AI-powered weekly schedule
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {sessions.length > 0 && (
            <button
              onClick={() => exportStudyPlanToPDF(sessions, assignments)}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, color: T.text, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> PDF
            </button>
          )}
          <button
            onClick={generateStudyPlan}
            disabled={loading}
            style={{ padding: '9px 20px', borderRadius: 8, background: loading ? 'rgba(196,77,255,0.4)' : 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}
          >
            <Sparkles size={14} />
            {loading ? 'Generating...' : generated ? 'Regenerate' : 'Generate Plan'}
          </button>
        </div>
      </motion.div>

      {sessions.length > 0 ? (
        <>
          {/* AI Insight */}
          {aiInsight && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
              <div style={{ padding: '16px 20px', borderRadius: 12, background: `${T.blueVibrant}08`, border: `1px solid ${T.blueVibrant}22`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: `linear-gradient(135deg, ${T.blue}, ${T.blueVibrant})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} style={{ color: '#10141a' }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.blue, marginBottom: 5, textTransform: 'uppercase' }}>
                    Shiori AI Insight
                  </p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.65 }}>
                    {aiInsight}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { icon: BookOpen, label: 'Total Sessions', value: sessions.length, color: T.blue },
              { icon: CheckCircle, label: 'Completed', value: completedCount, color: T.green },
              { icon: Clock, label: 'Study Time', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: T.purple },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -2 }}
              >
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${stat.color}18`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <stat.icon size={19} style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted }}>
                        {stat.label}
                      </p>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: stat.color, lineHeight: 1, marginTop: 3 }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly schedule */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: T.text }}>
                  Weekly Schedule
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} style={{ color: T.purple }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint }}>
                    AI-generated · drag to reorder · click to complete
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {Object.entries(groupedSessions).map(([dateKey, daySessions]) => {
                  const date = new Date(dateKey)
                  const isToday = date.toDateString() === today.toDateString()
                  const isPast = date < today && !isToday
                  const dayCompleted = daySessions.filter(s => s.completed).length

                  return (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {/* Day header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          background: isToday ? `${T.blueVibrant}18` : 'rgba(20,25,34,0.6)',
                          border: `1px solid ${isToday ? `${T.blueVibrant}45` : T.border}`,
                          opacity: isPast ? 0.45 : 1,
                        }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 9, color: T.faint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: isToday ? T.blue : T.text, lineHeight: 1, marginTop: 1 }}>
                            {date.getDate()}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: T.text }}>
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </p>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 1 }}>
                            {dayCompleted}/{daySessions.length} done · {daySessions.reduce((s, ss) => s + ss.duration, 0)} min
                          </p>
                        </div>
                        {isToday && (
                          <span style={{ padding: '4px 10px', borderRadius: 20, background: `${T.blueVibrant}20`, border: `1px solid ${T.blueVibrant}40`, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: T.blue, letterSpacing: '0.06em' }}>
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Session items */}
                      <div style={{ marginLeft: 12, paddingLeft: 16, borderLeft: `2px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {daySessions.map((session) => (
                          <motion.div
                            key={session.id}
                            whileHover={{ x: 2 }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, session.id)}
                            onDragOver={(e) => handleDragOver(e, session.id)}
                            onDrop={(e) => handleDrop(e, session.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => toggleSession(session.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                              background: session.completed ? `${T.green}07` : 'rgba(20,25,34,0.5)',
                              opacity: draggedId === session.id ? 0.3 : session.completed ? 0.65 : 1,
                              border: dragOverId === session.id
                                ? `1px solid ${T.purpleVibrant}60`
                                : `1px solid ${session.completed ? `${T.green}25` : T.border}`,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <GripVertical size={13} style={{ color: T.faint, flexShrink: 0, cursor: 'grab' }} />
                            {session.completed
                              ? <CheckCircle size={18} style={{ color: T.green, flexShrink: 0 }} />
                              : <Circle size={18} style={{ color: T.faint, flexShrink: 0 }} />
                            }
                            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: COURSE_COLORS[session.courseId] || T.blue }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: T.text, textDecoration: session.completed ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {session.title}
                              </p>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 3 }}>
                                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted }}>
                                  {session.courseName}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted }}>
                                  <Clock size={10} /> {session.duration} min
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {session.priority === 'high' && (
                                <AlertTriangle size={13} style={{ color: priorityColor.high }} />
                              )}
                              <span style={{ padding: '2px 8px', borderRadius: 20, background: `${T.purple}15`, border: `1px solid ${T.purple}30`, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 10, color: T.purple, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Sparkles size={9} /> AI
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        /* Empty state */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px', background: 'linear-gradient(135deg, rgba(196,77,255,0.15), rgba(82,141,255,0.10))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sparkles size={32} style={{ color: T.purpleVibrant }} />
            </motion.div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: T.text, marginBottom: 12 }}>
              No Plan Yet
            </h3>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Generate an AI-powered study plan based on your upcoming assignments.
              Shiori will build a day-by-day schedule that prioritizes what matters most.
            </p>
            <button
              onClick={generateStudyPlan}
              disabled={loading}
              style={{ padding: '12px 28px', borderRadius: 10, background: loading ? 'rgba(196,77,255,0.4)' : 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              <Sparkles size={16} />
              {loading ? 'Generating...' : 'Generate AI Study Plan'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default StudyPlans
