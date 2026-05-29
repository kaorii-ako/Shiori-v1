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

  if (!hasClientKey() && !briefing) return null

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <GlassCard style={{
        background: 'linear-gradient(135deg, rgba(196,77,255,0.07) 0%, rgba(82,141,255,0.05) 100%)',
        border: '1px solid rgba(196,77,255,0.25)',
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
              letterSpacing: '0.06em', marginBottom: 6,
            }}>SHIORI AI · DAILY BRIEFING</div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c90a0', fontFamily: "'Manrope', sans-serif", fontSize: 13 }}>
                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                Generating your briefing…
              </div>
            ) : briefing ? (
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#c4c8d4', lineHeight: 1.6, margin: 0 }}>
                {briefing}
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
      </GlassCard>
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
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <GlassCard style={{ height: '100%' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, opacity: 0.12,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', marginBottom: 10, letterSpacing: '0.05em' }}>
            {label}
          </p>
          <p style={{ fontFamily: '"Press Start 2P"', fontSize: 22,
            background: `linear-gradient(135deg, ${color} 0%, #fff 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {value}
          </p>
          {sub && <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ padding: 10, background: `${color}22`, border: `2px solid ${color}44`,
          boxShadow: `2px 2px 0 ${color}44`, borderRadius: 4 }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </GlassCard>
  </motion.div>
)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16, marginBottom: 8,
            background: 'linear-gradient(135deg, #afc6ff, #e5b5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WELCOME BACK{user?.name ? `, ${user.name.split(' ')[0].toUpperCase()}` : ''}
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 20, color: '#8c90a0' }}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => navigate('/assignments')}
            style={{ borderColor: '#ff6b9d', color: '#ff6b9d' }}>ADD</Button>
          <Button size="sm" variant="secondary" icon={Play} onClick={() => navigate('/study')}
            style={{ borderColor: '#4dff91', color: '#4dff91' }}>STUDY</Button>
          <Button size="sm" variant="secondary" icon={Sparkles} onClick={toggleAIChat}
            style={{ borderColor: '#c44dff', color: '#c44dff' }}>AI CHAT</Button>
        </div>
      </motion.div>

      {/* Daily AI Briefing */}
      <DailyBriefing assignments={assignments} gpaData={gpaData} userName={user?.name} />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard icon={ClipboardList} label="DUE TODAY" value={todaysAssignments.length || '0'} color="#ffaa4d"
          sub={todaysAssignments.length === 0 ? 'All clear!' : 'tasks remaining'} delay={0.05} />
        <StatCard icon={Calendar} label="THIS WEEK" value={upcomingAssignments.length} color="#c44dff"
          sub={`${overdueTasks.length} overdue`} delay={0.1} />
        <StatCard icon={TrendingUp} label="AVG GRADE"
          value={gpaData?.overall ? `${gpaData.overall}%` : '—'}
          color="#4dff91"
          sub={gpaData?.overall ? getLetterGrade(parseFloat(gpaData.overall)).letter : 'no grades yet'} delay={0.15} />
        <StatCard icon={Flame} label="STREAK" value={`${streak}d`} color="#ff6b9d"
          sub="days in a row" delay={0.2} />
        {daysUntilExam !== null && (
          <StatCard icon={AlertTriangle} label="NEXT EXAM" value={`${daysUntilExam}d`} color="#ff4d6a"
            sub={nextExam?.title?.slice(0, 16) + '…'} delay={0.25} />
        )}
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left: Upcoming tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12 }}>UPCOMING TASKS</h2>
              <Link to="/assignments" style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#ff6b9d',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                VIEW ALL <ChevronRight size={12} />
              </Link>
            </div>

            {upcomingAssignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingAssignments.slice(0, 6).map((a, idx) => {
                  const dueDate = new Date(a.dueDate)
                  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                  const urgent = daysLeft <= 2
                  const courseColor = { 'course-1': '#ff6b9d', 'course-2': '#c44dff', 'course-3': '#4daaff', 'course-4': '#4dff91', 'course-5': '#ffd6a0' }[a.courseId] || '#afc6ff'
                  return (
                    <motion.div key={a.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => navigate('/assignments')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', cursor: 'pointer',
                        background: urgent ? 'rgba(255,77,106,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${urgent ? 'rgba(255,77,106,0.4)' : 'rgba(196,77,255,0.2)'}`,
                        borderRadius: 6,
                        boxShadow: urgent ? '2px 2px 0 rgba(255,77,106,0.2)' : 'none',
                        transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 3, height: 40, background: courseColor,
                          boxShadow: `0 0 8px ${courseColor}`, borderRadius: 2, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontFamily: 'VT323', fontSize: 20, lineHeight: 1.2 }}>{a.title}</p>
                          <p style={{ fontFamily: 'VT323', fontSize: 15, color: '#606080' }}>{a.courseName}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {a.estimatedHours && (
                          <span style={{ fontFamily: 'VT323', fontSize: 13, color: '#606080' }}>
                            ~{a.estimatedHours}h
                          </span>
                        )}
                        <Badge variant={urgent ? 'danger' : daysLeft <= 5 ? 'warning' : 'info'}>
                          <Clock size={10} style={{ marginRight: 3 }} />
                          {daysLeft === 0 ? 'TODAY' : daysLeft === 1 ? 'TOMORROW' : `${daysLeft}d`}
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: 64, height: 64, margin: '0 auto 16px',
                  background: 'rgba(77,255,145,0.1)', border: '3px solid #4dff91',
                  boxShadow: '4px 4px 0 #4dff91', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={28} style={{ color: '#4dff91' }} />
                </div>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#4dff91', marginBottom: 8 }}>ALL CLEAR!</p>
                <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0' }}>No upcoming deadlines this week!</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Insight */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Sparkles size={18} style={{ color: '#ff6b9d' }} />
                <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10,
                  background: 'linear-gradient(135deg, #ff6b9d, #c44dff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI INSIGHT</h2>
              </div>
              <div style={{ padding: '12px 14px', marginBottom: 12,
                background: 'linear-gradient(135deg, rgba(255,107,157,0.08) 0%, rgba(196,77,255,0.08) 100%)',
                border: '1px solid rgba(196,77,255,0.25)', borderRadius: 6 }}>
                <p style={{ fontFamily: 'VT323', fontSize: 17, lineHeight: 1.5 }}>
                  {topPriority ? (
                    <>
                      Start with{' '}
                      <span style={{ color: '#afc6ff', fontWeight: 700 }}>"{topPriority.title}"</span>
                      {' '}— it's your highest priority.
                      {daysUntilExam !== null && daysUntilExam <= 14 && (
                        <> Also: <span style={{ color: '#ff4d6a' }}>{nextExam?.title}</span> in {daysUntilExam} days — review now!</>
                      )}
                    </>
                  ) : (
                    <><span style={{ color: '#4dff91' }}>You're all caught up!</span> Great time to review or get ahead.</>
                  )}
                </p>
              </div>
              <button onClick={() => navigate('/study')} style={{
                width: '100%', padding: '8px 12px', background: 'rgba(196,77,255,0.12)',
                border: '1px solid rgba(196,77,255,0.3)', borderRadius: 6, cursor: 'pointer',
                fontFamily: '"Press Start 2P"', fontSize: 9, color: '#c44dff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <Zap size={13} /> GENERATE STUDY PLAN
              </button>
            </GlassCard>
          </motion.div>

          {/* GPA Breakdown */}
          {gpaData?.courseList?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <GlassCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Trophy size={16} style={{ color: '#ffd6a0' }} />
                  <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#dfe2eb' }}>GPA OVERVIEW</h2>
                  <Link to="/grades" style={{ marginLeft: 'auto', fontFamily: '"Press Start 2P"', fontSize: 8,
                    color: '#606080', textDecoration: 'none' }}>DETAILS →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {gpaData.courseList.slice(0, 5).map(c => (
                    <div key={c.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#dfe2eb' }}>{c.name}</span>
                        <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: c.grade.color }}>
                          {c.pct}% {c.grade.letter}
                        </span>
                      </div>
                      <MiniProgressBar value={parseFloat(c.pct)} color={c.color} />
                    </div>
                  ))}
                  {gpaData.overall && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, marginTop: 4,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#8c90a0' }}>OVERALL</span>
                      <span style={{ fontFamily: '"Press Start 2P"', fontSize: 12,
                        color: getLetterGrade(parseFloat(gpaData.overall)).color }}>
                        {gpaData.overall}%
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard>
          <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, marginBottom: 16 }}>RECENT ACTIVITY</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { text: 'Study plan generated for this week', subtext: 'AI scheduled 4 sessions around your exams', time: '1h ago', color: '#c44dff' },
              { text: 'Grade posted: Lab 2 — Projectile Motion', subtext: '91/100 — Nice work!', time: '3h ago', color: '#4dff91' },
              { text: 'New assignment: Research Proposal', subtext: 'English Composition — due in 5 days', time: '6h ago', color: '#ffd6a0' },
              { text: 'Pomodoro session completed', subtext: '25 min focused on BST Implementation', time: 'Yesterday', color: '#afc6ff' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                <div style={{ width: 6, height: 6, marginTop: 6, borderRadius: '50%', flexShrink: 0,
                  background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'VT323', fontSize: 18 }}>{a.text}</p>
                  <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080' }}>{a.subtext}</p>
                </div>
                <span style={{ fontFamily: '"Press Start 2P"', fontSize: 7, color: '#424754', flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Home
