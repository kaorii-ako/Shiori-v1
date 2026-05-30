import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, TrendingUp, Clock, Target, Flame,
  Trophy, BookOpen, Layers, CheckCircle, AlertCircle, Share2, Download,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import StudyHeatmap from '../components/StudyHeatmap'
import GradeTrendChart from '../components/GradeTrendChart'
import SemesterCard from '../components/SemesterCard'
import { useAssignmentsStore, useGradesStore, useFlashcardsStore, usePomodoroStore, useAuthStore } from '../stores'

function generateShareCard({ gpa, focusMinutes, sessionCount, completed, total, mastered, totalCards, username }) {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 500
  const ctx = canvas.getContext('2d')

  // Background
  const grad = ctx.createLinearGradient(0, 0, 900, 500)
  grad.addColorStop(0, '#10141a')
  grad.addColorStop(1, '#14181e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 900, 500)

  // Decorative orbs
  const orb = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  orb(100, 100, 200, 'rgba(196,77,255,0.12)')
  orb(800, 400, 180, 'rgba(82,141,255,0.10)')
  orb(450, 480, 150, 'rgba(77,255,145,0.07)')

  // Logo + title
  ctx.fillStyle = '#afc6ff'
  ctx.font = 'bold 18px "Arial"'
  ctx.fillText('栞 SHIORI', 50, 58)

  ctx.fillStyle = '#424754'
  ctx.font = '13px Arial'
  ctx.fillText('Weekly Progress Report', 50, 78)

  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  ctx.fillStyle = '#424754'
  ctx.font = '12px monospace'
  ctx.fillText(date, 900 - 50 - ctx.measureText(date).width, 58)

  // Stats grid
  const stats = [
    { label: 'GPA', value: gpa || '—', color: '#4dff91' },
    { label: 'FOCUS', value: `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`, color: '#c44dff' },
    { label: 'SESSIONS', value: String(sessionCount), color: '#afc6ff' },
    { label: 'DONE', value: `${completed}/${total}`, color: '#ffd6a0' },
    { label: 'MASTERED', value: `${mastered}/${totalCards}`, color: '#ff6b9d' },
  ]

  stats.forEach((s, i) => {
    const x = 50 + i * 166
    const y = 140

    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x, y, 150, 120, 12)
    ctx.fill()
    ctx.strokeStyle = `${s.color}33`
    ctx.lineWidth = 1
    roundRect(ctx, x, y, 150, 120, 12)
    ctx.stroke()

    // Value
    ctx.fillStyle = s.color
    ctx.font = 'bold 28px "Arial"'
    const vw = ctx.measureText(s.value).width
    ctx.fillText(s.value, x + 75 - vw / 2, y + 62)

    // Label
    ctx.fillStyle = '#606080'
    ctx.font = '11px monospace'
    const lw = ctx.measureText(s.label).width
    ctx.fillText(s.label, x + 75 - lw / 2, y + 88)
  })

  // Bottom tagline
  ctx.fillStyle = '#424754'
  ctx.font = '13px Arial'
  ctx.fillText('shiori-v1.vercel.app — free, open-source AI study companion', 50, 460)

  if (username) {
    ctx.fillStyle = '#8c90a0'
    ctx.font = '13px Arial'
    const uw = ctx.measureText(`@${username}`).width
    ctx.fillText(`@${username}`, 900 - 50 - uw, 460)
  }

  return canvas
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const BAR_COLORS = ['#ff6b9d', '#c44dff', '#afc6ff', '#4dff91', '#ffd6a0']

const MiniBar = ({ value, max, color, label, sublabel }) => {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#c8ccd8' }}>{label}</span>
        <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color }}>
          {sublabel}
        </span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 4 }}
        />
      </div>
    </div>
  )
}

const StatBox = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <GlassCard style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ padding: 8, background: `${color}18`, borderRadius: 8, border: `1px solid ${color}33` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>{label}</span>
      </div>
      <p style={{ fontFamily: '"Press Start 2P"', fontSize: 22, color, marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0' }}>{sub}</p>}
    </GlassCard>
  </motion.div>
)

const WeekHeatmap = ({ data }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const max = Math.max(...data, 1)
  return (
    <div>
      <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#606080', marginBottom: 10 }}>
        LAST 7 DAYS ACTIVITY
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {data.map((v, i) => {
          const h = Math.max(v / max * 64, v > 0 ? 8 : 4)
          const opacity = v > 0 ? 0.3 + (v / max) * 0.7 : 0.12
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                initial={{ height: 4 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                style={{ width: '100%', background: '#c44dff', borderRadius: 3, opacity }}
              />
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 7, color: '#606080' }}>{days[i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Analytics = () => {
  const { assignments, courses } = useAssignmentsStore()
  const { courseGrades, calculateCourseGrade } = useGradesStore()
  const { decks } = useFlashcardsStore()
  const { sessionCount, totalFocusMinutes } = usePomodoroStore()
  const { user } = useAuthStore()
  const [sharePreview, setSharePreview] = useState(null)
  const [shareDownloading, setShareDownloading] = useState(false)
  const [showSemesterCard, setShowSemesterCard] = useState(false)

  const courseSummaries = useMemo(() => {
    if (!courses?.length) return []
    return courses.map((c, i) => {
      const cg = calculateCourseGrade(c.id)
      const pct = cg ? parseFloat(cg.percentage) : null
      return { ...c, pct, color: c.color || BAR_COLORS[i % BAR_COLORS.length] }
    }).filter(c => c.pct !== null)
  }, [courses, courseGrades])

  const overallGPA = useMemo(() => {
    if (!courseSummaries.length) return null
    const GRADE_SCALE = [
      { min: 93, gpa: 4.0 }, { min: 90, gpa: 3.7 }, { min: 87, gpa: 3.3 },
      { min: 83, gpa: 3.0 }, { min: 80, gpa: 2.7 }, { min: 77, gpa: 2.3 },
      { min: 73, gpa: 2.0 }, { min: 70, gpa: 1.7 }, { min: 67, gpa: 1.3 },
      { min: 63, gpa: 1.0 }, { min: 60, gpa: 0.7 }, { min: 0, gpa: 0.0 },
    ]
    const getGPA = (pct) => (GRADE_SCALE.find(g => pct >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1]).gpa
    const sum = courseSummaries.reduce((acc, c) => acc + getGPA(c.pct), 0)
    return (sum / courseSummaries.length).toFixed(2)
  }, [courseSummaries])

  const assignmentStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter(a => a.status === 'completed' || a.status === 'graded').length
    const pending = assignments.filter(a => a.status === 'pending').length
    const inProgress = assignments.filter(a => a.status === 'in-progress').length
    const overdue = assignments.filter(a => {
      if (!a.dueDate || a.status === 'completed' || a.status === 'graded') return false
      return new Date(a.dueDate) < new Date()
    }).length
    return { total, completed, pending, inProgress, overdue }
  }, [assignments])

  const flashcardStats = useMemo(() => {
    const totalCards = decks.reduce((s, d) => s + d.cards.length, 0)
    const mastered = decks.reduce((s, d) => s + d.cards.filter(c => (c.streak || 0) >= 3).length, 0)
    return { decks: decks.length, totalCards, mastered }
  }, [decks])

  // Simulated 7-day activity (in real app this would be persisted session data)
  const weekActivity = useMemo(() => {
    const base = [assignments.filter(a => a.status === 'completed').length, sessionCount]
    return [2, 5, 3, 7, 4, sessionCount + 2, 6].map(v => Math.min(v + Math.floor(Math.random() * 2), 10))
  }, [sessionCount])

  // Annual activity heatmap — from persisted sessions or demo data
  const { activityMap, totalHeatmapMinutes } = useMemo(() => {
    const stored = localStorage.getItem('shiori-activity-map')
    if (stored) {
      try {
        const map = JSON.parse(stored)
        const total = Object.values(map).reduce((s, v) => s + v, 0)
        return { activityMap: map, totalHeatmapMinutes: total }
      } catch {}
    }
    // Demo: generate plausible past-year activity
    const map = {}
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const dow = d.getDay()
      const isWeekend = dow === 0 || dow === 6
      const rand = Math.random()
      if (rand < (isWeekend ? 0.35 : 0.70)) {
        map[ds] = Math.floor(Math.random() * 150) + (rand < 0.15 ? 120 : 20)
      }
    }
    const total = Object.values(map).reduce((s, v) => s + v, 0)
    return { activityMap: map, totalHeatmapMinutes: total }
  }, [sessionCount])

  const maxGrade = courseSummaries.length > 0 ? Math.max(...courseSummaries.map(c => c.pct)) : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
          background: 'linear-gradient(135deg, #ffd6a0, #c44dff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ANALYTICS
        </h1>
        <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
          Your study performance at a glance
        </p>
      </motion.div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        <StatBox icon={TrendingUp} label="CUMULATIVE GPA" value={overallGPA || '—'}
          sub={overallGPA ? `${courseSummaries.length} courses tracked` : 'Add grades to see GPA'}
          color="#4dff91" delay={0} />
        <StatBox icon={CheckCircle} label="ASSIGNMENTS DONE"
          value={`${assignmentStats.completed}/${assignmentStats.total}`}
          sub={`${assignmentStats.overdue > 0 ? `${assignmentStats.overdue} overdue` : 'No overdue tasks'}`}
          color={assignmentStats.overdue > 0 ? '#ff8f6b' : '#afc6ff'} delay={0.05} />
        <StatBox icon={Clock} label="FOCUS TIME"
          value={`${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`}
          sub={`${sessionCount} Pomodoro sessions`}
          color="#c44dff" delay={0.1} />
        <StatBox icon={Layers} label="CARDS MASTERED"
          value={flashcardStats.mastered}
          sub={`of ${flashcardStats.totalCards} total cards`}
          color="#ffd6a0" delay={0.15} />
        {user?.streak > 0 && (
          <StatBox icon={Flame} label="STUDY STREAK"
            value={`${user.streak}d`}
            sub="Keep it going!"
            color="#ff6b9d" delay={0.2} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Grade breakdown */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Target size={16} style={{ color: '#4dff91' }} />
              <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>GRADE BREAKDOWN</h2>
            </div>
            {courseSummaries.length > 0 ? (
              courseSummaries.map((c) => (
                <MiniBar
                  key={c.id}
                  label={c.name}
                  value={c.pct}
                  max={100}
                  color={c.color}
                  sublabel={`${c.pct}%`}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#424754' }}>
                <Target size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontFamily: 'VT323', fontSize: 16 }}>Add grades to see breakdown</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Assignment completion */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <BookOpen size={16} style={{ color: '#afc6ff' }} />
                <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>ASSIGNMENT STATUS</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { label: 'Completed', value: assignmentStats.completed, color: '#4dff91' },
                  { label: 'In Progress', value: assignmentStats.inProgress, color: '#afc6ff' },
                  { label: 'Pending', value: assignmentStats.pending, color: '#ffd6a0' },
                  { label: 'Overdue', value: assignmentStats.overdue, color: '#ff4d6a' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${s.color}22`, borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontFamily: '"Press Start 2P"', fontSize: 18, color: s.color, marginBottom: 4 }}>{s.value}</p>
                    <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {assignmentStats.total > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0' }}>Completion rate</span>
                    <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#4dff91' }}>
                      {Math.round(assignmentStats.completed / assignmentStats.total * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${assignmentStats.completed / assignmentStats.total * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #4dff91, #afc6ff)', borderRadius: 4 }}
                    />
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Weekly activity heatmap */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard>
              <WeekHeatmap data={weekActivity} />
            </GlassCard>
          </motion.div>

          {/* Flashcard progress */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Layers size={16} style={{ color: '#ffd6a0' }} />
                <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>FLASHCARD MASTERY</h2>
              </div>
              {decks.length > 0 ? (
                decks.map((deck) => {
                  const mastered = deck.cards.filter(c => (c.streak || 0) >= 3).length
                  const total = deck.cards.length
                  return (
                    <MiniBar
                      key={deck.id}
                      label={deck.name}
                      value={mastered}
                      max={Math.max(total, 1)}
                      color="#ffd6a0"
                      sublabel={`${mastered}/${total}`}
                    />
                  )
                })
              ) : (
                <p style={{ fontFamily: 'VT323', fontSize: 16, color: '#424754', textAlign: 'center', padding: '16px 0' }}>
                  Create flashcard decks to track mastery
                </p>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Grade trend chart */}
      {courseSummaries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <GlassCard>
            <GradeTrendChart
              courses={courseSummaries.map(c => ({
                ...c,
                grades: Object.values(courseGrades[c.id] || {}).map(g => ({
                  percentage: typeof g === 'object' ? (g.earned / g.possible * 100) : g,
                  date: g.date || new Date().toISOString(),
                })),
              }))}
            />
          </GlassCard>
        </motion.div>
      )}

      {/* Annual study heatmap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
        <GlassCard>
          <StudyHeatmap activityMap={activityMap} totalMinutes={totalHeatmapMinutes} />
        </GlassCard>
      </motion.div>

      {/* Share progress card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Share2 size={16} style={{ color: '#afc6ff' }} />
              <div>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#afc6ff' }}>SHARE PROGRESS</p>
                <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0', marginTop: 2 }}>Generate a shareable progress card</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShareDownloading(true)
                try {
                  const canvas = generateShareCard({
                    gpa: overallGPA,
                    focusMinutes: totalFocusMinutes,
                    sessionCount,
                    completed: assignmentStats.completed,
                    total: assignmentStats.total,
                    mastered: flashcardStats.mastered,
                    totalCards: flashcardStats.totalCards,
                    username: user?.username || user?.firstName,
                  })
                  const url = canvas.toDataURL('image/png')
                  setSharePreview(url)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `shiori-progress-${new Date().toISOString().split('T')[0]}.png`
                  a.click()
                } finally {
                  setShareDownloading(false)
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(175,198,255,0.2), rgba(82,141,255,0.15))',
                border: '1px solid rgba(175,198,255,0.25)',
                color: '#afc6ff', fontFamily: '"Press Start 2P"', fontSize: 8,
              }}
            >
              <Download size={13} /> DOWNLOAD CARD
            </button>
          </div>
          {sharePreview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 14, overflow: 'hidden' }}>
              <img src={sharePreview} alt="Progress card" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(66,71,84,0.3)' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just checked my study stats on Shiori 📚\n\nGPA: ${overallGPA || '—'} | ${assignmentStats.completed}/${assignmentStats.total} assignments done\n\nFree AI study companion for students 👇\nhttps://github.com/kaorii-ako/Shiori-v1\n\n#Shiori #StudyTips #OpenSource`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontFamily: '"Press Start 2P"', fontSize: 8,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  TWEET THIS
                </a>
                <a
                  href="https://github.com/kaorii-ako/Shiori-v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                    background: 'rgba(175,198,255,0.08)', border: '1px solid rgba(175,198,255,0.2)',
                    color: '#afc6ff', fontFamily: '"Press Start 2P"', fontSize: 8,
                  }}
                >
                  ⭐ STAR ON GITHUB
                </a>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>

      {/* Semester Report Card trigger */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <button
          onClick={() => setShowSemesterCard(true)}
          style={{
            width: '100%', padding: '16px', borderRadius: 12, cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(255,215,160,0.1), rgba(196,77,255,0.08))',
            border: '1px solid rgba(255,215,160,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Trophy size={16} style={{ color: '#ffd6a0' }} />
          <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#ffd6a0' }}>
            GENERATE SEMESTER REPORT CARD
          </span>
          <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080' }}>
            — shareable PNG with all your stats
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {showSemesterCard && <SemesterCard onClose={() => setShowSemesterCard(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default Analytics
