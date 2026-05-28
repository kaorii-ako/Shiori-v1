import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Calendar,
  Brain,
  AlertTriangle,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAssignmentsStore, useAuthStore } from '../stores'
import { ai } from '../lib/api'

const COURSE_COLORS = {
  'course-1': '#ff6b9d',
  'course-2': '#c44dff',
  'course-3': '#4daaff',
  'course-4': '#4dff91',
  'course-5': '#ffd6a0',
}

// Build smart sessions from actual assignments
const buildSessionsFromAssignments = (assignments) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessions = []

  const pending = assignments
    .filter(a => a.status !== 'graded' && a.status !== 'completed' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (pending.length === 0) return []

  // Distribute assignments across 7 days prioritizing by due date
  const daySlots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { date: d, sessions: [] }
  })

  pending.forEach((assignment, idx) => {
    const dueDate = new Date(assignment.dueDate)
    const daysUntilDue = Math.max(0, Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)))
    const estimatedHours = assignment.estimatedHours || 2
    const numSessions = Math.min(Math.ceil(estimatedHours / 1.5), 3)

    // Place sessions leading up to the due date
    for (let s = 0; s < numSessions; s++) {
      const dayOffset = Math.max(0, Math.min(6, daysUntilDue - numSessions + s + 1))
      const slot = daySlots[dayOffset]

      slot.sessions.push({
        id: `${assignment.id}-${s}`,
        title: assignment.title,
        courseName: assignment.courseName,
        courseId: assignment.courseId,
        date: slot.date,
        duration: s === 0 ? 90 : 60,
        completed: false,
        aiGenerated: true,
        priority: assignment.priority || 'medium',
        dueDate: assignment.dueDate,
      })
    }
  })

  // Flatten and sort
  return daySlots.flatMap(slot => slot.sessions)
}

const StudyPlans = () => {
  const { assignments } = useAssignmentsStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [aiInsight, setAiInsight] = useState(null)
  const [generated, setGenerated] = useState(false)

  // Auto-generate for demo mode
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
    high: '#ff6b9d',
    medium: '#ffaa4d',
    low: '#4dff91',
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="gradient-text mb-1"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '16px' }}
          >
            STUDY PLANS
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
            AI-powered weekly schedule
          </p>
        </div>
        <Button
          icon={Sparkles}
          onClick={generateStudyPlan}
          loading={loading}
        >
          {generated ? 'REGENERATE' : 'GENERATE PLAN'}
        </Button>
      </motion.div>

      {sessions.length > 0 ? (
        <>
          {/* AI Insight */}
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div style={{
                padding: '16px 20px', borderRadius: 10,
                background: 'rgba(82,141,255,0.08)',
                border: '1px solid rgba(82,141,255,0.20)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 32, height: 32, flexShrink: 0, borderRadius: 8,
                  background: 'linear-gradient(45deg, #afc6ff, #528dff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={16} style={{ color: '#10141a' }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12, color: '#afc6ff', marginBottom: 4 }}>
                    SHIORI AI INSIGHT
                  </p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', lineHeight: 1.6 }}>
                    {aiInsight}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, label: 'Total Sessions', value: sessions.length, color: '#afc6ff', bg: 'rgba(82,141,255,0.12)' },
              { icon: CheckCircle, label: 'Completed', value: completedCount, color: '#4dff91', bg: 'rgba(74,215,120,0.12)' },
              { icon: Clock, label: 'Study Time', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: '#e5b5ff', bg: 'rgba(196,77,255,0.12)' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <stat.icon size={20} style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080' }}>{stat.label}</p>
                      <p style={{ fontFamily: '"Press Start 2P"', fontSize: 16, color: stat.color, marginTop: 2 }}>{stat.value}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Weekly Schedule */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#dfe2eb' }}>
                WEEKLY SCHEDULE
              </h2>
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: '#e5b5ff' }} />
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
                  AI-generated · click to mark complete
                </span>
              </div>
            </div>

            <div className="space-y-6">
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
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? 'rgba(82,141,255,0.15)' : 'rgba(24,28,34,0.6)',
                        border: isToday ? '1px solid rgba(82,141,255,0.4)' : '1px solid rgba(66,71,84,0.25)',
                        opacity: isPast ? 0.5 : 1,
                      }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: '#606080', letterSpacing: '0.08em' }}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                        </span>
                        <span style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: isToday ? '#afc6ff' : '#dfe2eb' }}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: '#dfe2eb' }}>
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080' }}>
                          {dayCompleted}/{daySessions.length} done · {daySessions.reduce((s, ss) => s + ss.duration, 0)} min
                        </p>
                      </div>
                      {isToday && <Badge variant="primary">TODAY</Badge>}
                    </div>

                    <div style={{ marginLeft: 12, paddingLeft: 16, borderLeft: '2px solid rgba(66,71,84,0.25)' }} className="space-y-2">
                      {daySessions.map((session) => (
                        <motion.div
                          key={session.id}
                          whileHover={{ x: 2 }}
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          style={{
                            borderRadius: 8,
                            background: session.completed ? 'rgba(74,215,120,0.06)' : 'rgba(24,28,34,0.50)',
                            border: `1px solid ${session.completed ? 'rgba(74,215,120,0.2)' : 'rgba(66,71,84,0.20)'}`,
                            opacity: session.completed ? 0.65 : 1,
                            transition: 'all 0.15s',
                          }}
                          onClick={() => toggleSession(session.id)}
                        >
                          {session.completed
                            ? <CheckCircle size={18} style={{ color: '#4dff91', flexShrink: 0 }} />
                            : <Circle size={18} style={{ color: '#424754', flexShrink: 0 }} />
                          }

                          {/* Course color dot */}
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: COURSE_COLORS[session.courseId] || '#afc6ff',
                          }} />

                          <div className="flex-1 min-w-0">
                            <p style={{
                              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13,
                              color: '#dfe2eb', textDecoration: session.completed ? 'line-through' : 'none',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {session.title}
                            </p>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
                              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080' }}>
                                {session.courseName}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080' }}>
                                <Clock size={10} /> {session.duration} min
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {session.priority === 'high' && (
                              <AlertTriangle size={13} style={{ color: priorityColor.high }} />
                            )}
                            <Badge variant="info" size="sm">
                              <Sparkles size={10} style={{ marginRight: 3 }} />
                              AI
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
                background: 'linear-gradient(135deg, rgba(196,77,255,0.15), rgba(82,141,255,0.10))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={28} style={{ color: '#c44dff' }} />
              </div>
              <h3 style={{ fontFamily: '"Press Start 2P"', fontSize: 14, color: '#dfe2eb', marginBottom: 12 }}>
                NO PLAN YET
              </h3>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Generate an AI-powered study plan based on your upcoming assignments.
                Shiori will build a day-by-day schedule that prioritizes what matters most.
              </p>
              <Button icon={Sparkles} onClick={generateStudyPlan} loading={loading}>
                GENERATE STUDY PLAN
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

export default StudyPlans
