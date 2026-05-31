import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ClipboardList,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Plus,
  Play,
  Star,
  Zap,
  Flame,
  Trophy,
  AlertTriangle,
  BookOpen,
  RefreshCw,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useAssignmentsStore, useGradesStore, useAuthStore, useEventStore, useUIStore } from '../stores'
import { callGeminiClient, hasClientKey } from '../utils/gemini'

const BRIEFING_CACHE_KEY = 'shiori-daily-briefing'

function getCachedBriefing() {
  try {
    const cached = JSON.parse(localStorage.getItem(BRIEFING_CACHE_KEY) || 'null')
    if (!cached) return null
    const today = new Date().toISOString().split('T')[0]
    return cached.date === today ? cached.text : null
  } catch { return null }
}

function cacheBriefing(text) {
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({ date: today, text }))
}

const DailyBriefing = ({ assignments, gpaData, userName }) => {
  const [briefing, setBriefing] = useState(() => getCachedBriefing())
  const [loading, setLoading] = useState(false)

  const generate = async (force = false) => {
    if (!hasClientKey()) return
    if (!force && briefing) return
    setLoading(true)
    const today = new Date()
    const due = assignments
      .filter(a => a.status !== 'graded' && a.status !== 'completed' && a.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(a => `- "${a.title}" due ${new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (${a.priority || 'medium'} priority)`)
      .join('\n')

    const prompt = `You are Shiori, an AI study companion. Write a short (2-3 sentences) personalized morning briefing for a student named ${userName || 'Student'}.

Today is ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
Their current GPA: ${gpaData?.overall ? `${gpaData.overall}%` : 'not yet tracked'}.

Upcoming assignments:
${due || 'No upcoming assignments.'}

Be warm, specific, and motivating. Mention 1-2 specific assignments by name. Keep it under 60 words. Do NOT include "Good morning" or their name — just the message.`

    const text = await callGeminiClient(prompt)
    setLoading(false)
    if (text) {
      setBriefing(text)
      cacheBriefing(text)
    }
  }

  useEffect(() => { generate() }, [])

  const { isDemo } = useAuthStore()

  const demoBriefing = "Your Calculus II problem set is due in 2 days — start with integration by parts tonight (est. 1.5h). The BST implementation for CS 301 is your biggest time sink this week; block 3h on Wednesday. Good news: you've completed 60% of this week's assignments. Keep the streak going 🔥"

  if (!hasClientKey() && !briefing && !isDemo) return null

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(196,77,255,0.07) 0%, rgba(82,141,255,0.05) 100%)',
        border: '1px solid rgba(196,77,255,0.25)',
        borderRadius: 12,
        padding: '18px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'rgba(196,77,255,0.15)',
            border: '1px solid rgba(196,77,255,0.3)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={18} style={{ color: '#c44dff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, fontWeight: 700, color: '#e5b5ff',
              letterSpacing: '0.08em', marginBottom: 6,
            }}>SHIORI AI · DAILY BRIEFING</div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c90a0', fontFamily: "'Manrope', sans-serif", fontSize: 13 }}>
                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                Generating your briefing…
              </div>
            ) : (briefing || (isDemo && demoBriefing)) ? (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#c4c8d4', lineHeight: 1.6, margin: 0 }}>
                {briefing || demoBriefing}
              </p>
            ) : (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', margin: 0 }}>
                Add your Gemini API key in Settings to get a personalized daily briefing.
              </p>
            )}
          </div>
          {briefing && !loading && (
            <button
              onClick={() => generate(true)}
              title="Regenerate"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#606080', padding: 4, flexShrink: 0,
              }}
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}

const GRADE_SCALE = [
  { min: 93, letter: 'A', color: '#4dff91' },
  { min: 90, letter: 'A-', color: '#4dff91' },
  { min: 87, letter: 'B+', color: '#afc6ff' },
  { min: 83, letter: 'B', color: '#afc6ff' },
  { min: 80, letter: 'B-', color: '#afc6ff' },
  { min: 77, letter: 'C+', color: '#ffd6a0' },
  { min: 73, letter: 'C', color: '#ffd6a0' },
  { min: 0, letter: 'D/F', color: '#ff4d6a' },
]

const getLetterGrade = (pct) => GRADE_SCALE.find(g => pct >= g.min) || { letter: 'F', color: '#ff4d6a' }

const MiniProgressBar = ({ value, color }) => (
  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
  </div>
)

const StatCard = ({ icon: Icon, label, value, color, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -2 }}
    style={{
      background: 'rgba(13,17,24,0.95)',
      border: '1px solid rgba(50,55,70,0.4)',
      borderRadius: 12,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
      borderRadius: '50%',
    }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
        letterSpacing: '0.08em', color: '#8c90a0', textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <p style={{
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28,
      color: '#dfe2eb', margin: '0 0 4px',
    }}>{value}</p>
    {sub && (
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0', margin: 0 }}>{sub}</p>
    )}
  </motion.div>
)

const COURSE_COLORS = {
  'course-1': '#ff6b9d',
  'course-2': '#c44dff',
  'course-3': '#4daaff',
  'course-4': '#4dff91',
  'course-5': '#ffd6a0',
}

const Home = () => {
  const { assignments } = useAssignmentsStore()
  const { courseGrades, calculateCourseGrade } = useGradesStore()
  const { courses } = useAssignmentsStore()
  const { user } = useAuthStore()
  const { events } = useEventStore()
  const { toggleAIChat } = useUIStore()
  const navigate = useNavigate()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const todaysAssignments = assignments.filter(a => {
    if (!a.dueDate) return false
    return new Date(a.dueDate).toISOString().split('T')[0] === todayStr
  })

  const upcomingAssignments = useMemo(() => assignments.filter(a => {
    if (!a.dueDate || a.status === 'graded' || a.status === 'completed') return false
    const due = new Date(a.dueDate)
    return due >= today && due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  }), [assignments])

  const overdueTasks = useMemo(() => assignments.filter(a => {
    if (!a.dueDate || a.status === 'graded' || a.status === 'completed') return false
    return new Date(a.dueDate) < today
  }), [assignments])

  const gpaData = useMemo(() => {
    if (!courses?.length) return null
    let totalPoints = 0, totalPossible = 0
    const courseList = []
    courses.forEach(c => {
      const grades = courseGrades[c.id]
      if (!grades) return
      let pts = 0, poss = 0
      Object.values(grades).forEach(g => { pts += g.pointsEarned; poss += g.pointsPossible })
      if (poss > 0) {
        const pct = (pts / poss) * 100
        totalPoints += pts
        totalPossible += poss
        courseList.push({ ...c, pct: pct.toFixed(1), grade: getLetterGrade(pct) })
      }
    })
    const overall = totalPossible > 0 ? ((totalPoints / totalPossible) * 100).toFixed(1) : null
    return { overall, courseList }
  }, [courses, courseGrades])

  const nextExam = useMemo(() => {
    if (!events?.length) return null
    return events
      .filter(e => e.type === 'exam' && new Date(e.start || e.date) >= today)
      .sort((a, b) => new Date(a.start || a.date) - new Date(b.start || b.date))[0] || null
  }, [events])

  const daysUntilExam = nextExam
    ? Math.ceil((new Date(nextExam.start || nextExam.date) - today) / (1000 * 60 * 60 * 24))
    : null

  const streak = user?.streak || 0

  const topPriority = useMemo(() => {
    return [...assignments]
      .filter(a => a.status !== 'graded' && a.status !== 'completed' && a.dueDate)
      .sort((a, b) => {
        const urgency = { high: 3, medium: 2, low: 1 }
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate)
        if (dateDiff !== 0) return dateDiff
        return (urgency[b.priority] || 0) - (urgency[a.priority] || 0)
      })[0] || null
  }, [assignments])

  const btnSecondary = {
    padding: '8px 16px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(50,55,70,0.4)',
    color: '#dfe2eb',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: '#dfe2eb',
            marginBottom: 4,
            background: 'linear-gradient(135deg, #dfe2eb, #afc6ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {user?.name ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Welcome back 👋'}
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0', margin: 0 }}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnSecondary} onClick={() => navigate('/assignments')}>
            <Plus size={14} /> ADD
          </button>
          <button style={btnSecondary} onClick={() => navigate('/study')}>
            <Play size={14} /> STUDY
          </button>
          <button style={{ ...btnSecondary, border: '1px solid rgba(196,77,255,0.35)', color: '#e5b5ff' }} onClick={toggleAIChat}>
            <Sparkles size={14} /> AI CHAT
          </button>
        </div>
      </motion.div>

      {/* Daily AI Briefing */}
      <DailyBriefing assignments={assignments} gpaData={gpaData} userName={user?.name} />

      {/* Stats grid — 4 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard
          icon={ClipboardList}
          label="Due Today"
          value={todaysAssignments.length || '0'}
          color="#ffd6a0"
          sub={todaysAssignments.length === 0 ? 'All clear!' : 'tasks remaining'}
          delay={0.05}
        />
        <StatCard
          icon={Calendar}
          label="This Week"
          value={upcomingAssignments.length}
          color="#c44dff"
          sub={`${overdueTasks.length} overdue`}
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Grade"
          value={gpaData?.overall ? `${gpaData.overall}%` : '—'}
          color="#4dff91"
          sub={gpaData?.overall ? getLetterGrade(parseFloat(gpaData.overall)).letter : 'no grades yet'}
          delay={0.15}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak}d`}
          color="#ff6b9d"
          sub="days in a row"
          delay={0.2}
        />
      </div>

      {/* AI Insight card — full width */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div style={{
          background: 'rgba(13,17,24,0.95)',
          border: '1px solid rgba(196,77,255,0.3)',
          borderRadius: 12,
          padding: '18px 22px',
          backgroundImage: 'linear-gradient(135deg, rgba(196,77,255,0.06) 0%, rgba(82,141,255,0.04) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(196,77,255,0.15)',
              border: '1px solid rgba(196,77,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} style={{ color: '#c44dff' }} />
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: '0.08em', color: '#e5b5ff', textTransform: 'uppercase',
            }}>AI Insight</span>
          </div>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#c4c8d4', lineHeight: 1.65, margin: 0 }}>
            {topPriority ? (
              <>
                Start with{' '}
                <span style={{ color: '#afc6ff', fontWeight: 700 }}>"{topPriority.title}"</span>
                {' '}— it's your highest priority right now.
                {daysUntilExam !== null && daysUntilExam <= 14 && (
                  <>
                    {' '}Also: <span style={{ color: '#ff6b9d', fontWeight: 700 }}>{nextExam?.title}</span> is in {daysUntilExam} days — start reviewing soon.
                  </>
                )}
              </>
            ) : (
              <>
                <span style={{ color: '#4dff91' }}>You're all caught up!</span> Great time to review material or get ahead on upcoming work.
              </>
            )}
          </p>
          {daysUntilExam !== null && daysUntilExam <= 7 && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,107,157,0.08)',
              border: '1px solid rgba(255,107,157,0.25)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={14} style={{ color: '#ff6b9d', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#ff6b9d' }}>
                Exam in {daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''} — prioritize review sessions
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Two-column: upcoming tasks + GPA breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Left: Upcoming tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div style={{
            background: 'rgba(13,17,24,0.95)',
            border: '1px solid rgba(50,55,70,0.4)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15, color: '#dfe2eb', margin: 0,
              }}>Upcoming Tasks</h2>
              <Link to="/assignments" style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12,
                color: '#8c90a0', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {upcomingAssignments.length > 0 ? (
              <div>
                {upcomingAssignments.slice(0, 6).map((a, idx) => {
                  const dueDate = new Date(a.dueDate)
                  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                  const urgent = daysLeft <= 2
                  const courseColor = COURSE_COLORS[a.courseId] || '#afc6ff'
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => navigate('/assignments')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 8,
                        background: urgent ? 'rgba(255,77,106,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${urgent ? 'rgba(255,77,106,0.3)' : 'rgba(50,55,70,0.4)'}`,
                        cursor: 'pointer', marginBottom: 8,
                      }}
                    >
                      <div style={{ width: 3, height: 36, borderRadius: 2, background: courseColor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14, color: '#dfe2eb', marginBottom: 2 }}>{a.title}</p>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0' }}>{a.courseName}</p>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6,
                        background: urgent ? 'rgba(255,77,106,0.15)' : 'rgba(175,198,255,0.1)',
                        color: urgent ? '#ff4d6a' : '#afc6ff',
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11,
                      }}>
                        {daysLeft === 0 ? 'TODAY' : `${daysLeft}d`}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{
                  width: 52, height: 52, margin: '0 auto 14px',
                  background: 'rgba(77,255,145,0.1)', border: '1px solid rgba(77,255,145,0.3)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Star size={24} style={{ color: '#4dff91' }} />
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#4dff91', marginBottom: 6 }}>All clear!</p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>No upcoming deadlines this week.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: GPA breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div style={{
            background: 'rgba(13,17,24,0.95)',
            border: '1px solid rgba(50,55,70,0.4)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={15} style={{ color: '#ffd6a0' }} />
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 15, color: '#dfe2eb', margin: 0,
                }}>GPA Breakdown</h2>
              </div>
              <Link to="/grades" style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12,
                color: '#8c90a0', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                Details <ChevronRight size={13} />
              </Link>
            </div>

            {gpaData?.courseList?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {gpaData.courseList.slice(0, 5).map(c => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 13, color: '#dfe2eb' }}>
                        {c.name}
                      </span>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
                        color: c.grade.color,
                      }}>
                        {c.pct}%
                      </span>
                    </div>
                    <MiniProgressBar value={parseFloat(c.pct)} color={c.grade.color} />
                  </div>
                ))}
                {gpaData.overall && (
                  <div style={{
                    borderTop: '1px solid rgba(50,55,70,0.4)', paddingTop: 12, marginTop: 2,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
                      letterSpacing: '0.08em', color: '#8c90a0', textTransform: 'uppercase',
                    }}>Overall GPA</span>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18,
                      color: getLetterGrade(parseFloat(gpaData.overall)).color,
                    }}>
                      {gpaData.overall}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <BookOpen size={28} style={{ color: '#424754', marginBottom: 10 }} />
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>
                  No grades tracked yet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div style={{
          background: 'rgba(13,17,24,0.95)',
          border: '1px solid rgba(50,55,70,0.4)',
          borderRadius: 12,
          padding: '20px 24px',
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15,
            color: '#dfe2eb', marginBottom: 16,
          }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { text: 'Study plan generated for this week', subtext: 'AI scheduled 4 sessions around your exams', time: '1h ago', color: '#c44dff' },
              { text: 'Grade posted: Lab 2 — Projectile Motion', subtext: '91/100 — Nice work!', time: '3h ago', color: '#4dff91' },
              { text: 'New assignment: Research Proposal', subtext: 'English Composition — due in 5 days', time: '6h ago', color: '#ffd6a0' },
              { text: 'Pomodoro session completed', subtext: '25 min focused on BST Implementation', time: 'Yesterday', color: '#afc6ff' },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '11px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(50,55,70,0.3)',
                  borderRadius: 8,
                }}
              >
                <div style={{
                  width: 6, height: 6, marginTop: 6, borderRadius: '50%', flexShrink: 0,
                  background: a.color,
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14, color: '#dfe2eb', marginBottom: 2 }}>{a.text}</p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0' }}>{a.subtext}</p>
                </div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
                  color: '#424754', flexShrink: 0, marginTop: 2,
                }}>{a.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* GitHub star nudge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          padding: '14px 20px', borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(196,77,255,0.06), rgba(82,141,255,0.04))',
          border: '1px solid rgba(80,90,110,0.3)',
        }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', margin: 0 }}>
            Shiori is 100% free &amp; open source. A ⭐ helps other students discover it.
          </p>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a
              href="https://github.com/kaorii-ako/Shiori-v1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8, textDecoration: 'none',
                background: 'linear-gradient(135deg, #c44dff, #528dff)',
                color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
              }}
            >
              <Star size={13} /> Star on GitHub
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Just discovered Shiori — free AI study companion that syncs Google Classroom, tracks GPA, and generates study plans with Gemini 🤖📚\n\nhttps://github.com/kaorii-ako/Shiori-v1\n\n#OpenSource #StudyTips')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(50,55,70,0.4)',
                color: '#8c90a0',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12,
              }}
            >
              Share
            </a>
          </div>
        </div>
      </motion.div>

    </div>
  )
}

export default Home
