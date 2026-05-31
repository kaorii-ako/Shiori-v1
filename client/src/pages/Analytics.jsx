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

function generateShareCard({ gpa, focusMinutes, sessionCount, completed, total, mastered, totalCards, username }) {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 500
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 900, 500)
  grad.addColorStop(0, '#10141a')
  grad.addColorStop(1, '#14181e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 900, 500)

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

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x, y, 150, 120, 12)
    ctx.fill()
    ctx.strokeStyle = `${s.color}33`
    ctx.lineWidth = 1
    roundRect(ctx, x, y, 150, 120, 12)
    ctx.stroke()

    ctx.fillStyle = s.color
    ctx.font = 'bold 28px "Arial"'
    const vw = ctx.measureText(s.value).width
    ctx.fillText(s.value, x + 75 - vw / 2, y + 62)

    ctx.fillStyle = '#606080'
    ctx.font = '11px monospace'
    const lw = ctx.measureText(s.label).width
    ctx.fillText(s.label, x + 75 - lw / 2, y + 88)
  })

  ctx.fillStyle = '#424754'
  ctx.font = '13px Arial'
  ctx.fillText('shiorii.tech — free, open-source AI study companion', 50, 460)

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
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12, color }}>
          {sublabel}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3, opacity: 0.85 }}
        />
      </div>
    </div>
  )
}

const StatBox = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -2 }}
    style={{ ...card, padding: '18px 20px', cursor: 'default' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} style={{ color }} />
      </div>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.faint, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color, lineHeight: 1, marginBottom: 4 }}>
      {value}
    </p>
    {sub && (
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted }}>
        {sub}
      </p>
    )}
  </motion.div>
)

const WeekHeatmap = ({ data }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const max = Math.max(...data, 1)
  return (
    <div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.faint, marginBottom: 12, textTransform: 'uppercase' }}>
        Last 7 Days Activity
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {data.map((v, i) => {
          const h = Math.max(v / max * 64, v > 0 ? 8 : 4)
          const opacity = v > 0 ? 0.3 + (v / max) * 0.7 : 0.12
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <motion.div
                initial={{ height: 4 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                style={{ width: '100%', background: T.purpleVibrant, borderRadius: 3, opacity }}
              />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 10, color: T.faint }}>
                {days[i]}
              </span>
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

  const weekActivity = useMemo(() => {
    const base = [assignments.filter(a => a.status === 'completed').length, sessionCount]
    return [2, 5, 3, 7, 4, sessionCount + 2, 6].map(v => Math.min(v + Math.floor(Math.random() * 2), 10))
  }, [sessionCount])

  const { activityMap, totalHeatmapMinutes } = useMemo(() => {
    const stored = localStorage.getItem('shiori-activity-map')
    if (stored) {
      try {
        const map = JSON.parse(stored)
        const total = Object.values(map).reduce((s, v) => s + v, 0)
        return { activityMap: map, totalHeatmapMinutes: total }
      } catch {}
    }
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: T.text, letterSpacing: '-0.02em' }}>
            Analytics
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 4 }}>
            Your study performance at a glance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSemesterCard(true)}
            style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(50,55,70,0.4)', color: T.text, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Trophy size={14} style={{ color: T.orange }} /> Report Card
          </button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        <StatBox
          icon={Clock}
          label="Focus Time"
          value={`${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`}
          sub={`${sessionCount} Pomodoro sessions`}
          color={T.purpleVibrant}
          delay={0}
        />
        <StatBox
          icon={BarChart3}
          label="Sessions"
          value={sessionCount}
          sub="Total focus sessions"
          color={T.blueVibrant}
          delay={0.05}
        />
        <StatBox
          icon={CheckCircle}
          label="Completion Rate"
          value={assignmentStats.total > 0 ? `${Math.round(assignmentStats.completed / assignmentStats.total * 100)}%` : '—'}
          sub={`${assignmentStats.completed} of ${assignmentStats.total} done`}
          color={assignmentStats.overdue > 0 ? T.pink : T.green}
          delay={0.1}
        />
        <StatBox
          icon={Layers}
          label="Cards Mastered"
          value={flashcardStats.mastered}
          sub={`of ${flashcardStats.totalCards} total`}
          color={T.orange}
          delay={0.15}
        />
        {user?.streak > 0 && (
          <StatBox
            icon={Flame}
            label="Study Streak"
            value={`${user.streak}d`}
            sub="Keep it going!"
            color={T.pink}
            delay={0.2}
          />
        )}
        {overallGPA && (
          <StatBox
            icon={TrendingUp}
            label="Cumulative GPA"
            value={overallGPA}
            sub={`${courseSummaries.length} courses tracked`}
            color={T.green}
            delay={0.25}
          />
        )}
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Grade breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div style={{ ...card, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.green}18`, border: `1px solid ${T.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={15} style={{ color: T.green }} />
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>
                Grade Breakdown
              </span>
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
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Target size={28} style={{ color: T.faint, margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint }}>
                  Add grades to see breakdown
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Assignment status */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.blue}18`, border: `1px solid ${T.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={15} style={{ color: T.blue }} />
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>
                  Assignment Status
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { label: 'Completed', value: assignmentStats.completed, color: T.green },
                  { label: 'In Progress', value: assignmentStats.inProgress, color: T.blue },
                  { label: 'Pending', value: assignmentStats.pending, color: T.orange },
                  { label: 'Overdue', value: assignmentStats.overdue, color: '#ff4d6a' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px', background: `${s.color}0a`, border: `1px solid ${s.color}22`, borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: s.color, marginBottom: 2 }}>
                      {s.value}
                    </p>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              {assignmentStats.total > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted }}>Completion rate</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: T.green }}>
                      {Math.round(assignmentStats.completed / assignmentStats.total * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${assignmentStats.completed / assignmentStats.total * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${T.green}, ${T.blue})`, borderRadius: 3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 7-day activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div style={card}>
              <WeekHeatmap data={weekActivity} />
            </div>
          </motion.div>

          {/* Flashcard mastery */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.orange}18`, border: `1px solid ${T.orange}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={15} style={{ color: T.orange }} />
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>
                  Flashcard Mastery
                </span>
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
                      color={T.orange}
                      sublabel={`${mastered}/${total}`}
                    />
                  )
                })
              ) : (
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, textAlign: 'center', padding: '16px 0' }}>
                  Create flashcard decks to track mastery
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grade trend chart */}
      {courseSummaries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.4 }}>
          <div style={card}>
            <GradeTrendChart
              courses={courseSummaries.map(c => ({
                ...c,
                grades: Object.values(courseGrades[c.id] || {}).map(g => ({
                  percentage: typeof g === 'object' ? (g.earned / g.possible * 100) : g,
                  date: g.date || new Date().toISOString(),
                })),
              }))}
            />
          </div>
        </motion.div>
      )}

      {/* Annual study heatmap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.4 }}>
        <div style={card}>
          <StudyHeatmap activityMap={activityMap} totalMinutes={totalHeatmapMinutes} />
        </div>
      </motion.div>

      {/* Share progress card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.blue}18`, border: `1px solid ${T.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={16} style={{ color: T.blue }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>
                  Share Progress
                </p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 2 }}>
                  Generate a shareable progress card
                </p>
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
              style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download Card
            </button>
          </div>

          {sharePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 16, overflow: 'hidden' }}
            >
              <img
                src={sharePreview}
                alt="Progress card"
                style={{ width: '100%', borderRadius: 8, border: `1px solid ${T.border}` }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just checked my study stats on Shiori 📚\n\nGPA: ${overallGPA || '—'} | ${assignmentStats.completed}/${assignmentStats.total} assignments done\n\nFree AI study companion for students 👇\nhttps://github.com/kaorii-ako/Shiori-v1\n\n#Shiori #StudyTips #OpenSource`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Tweet This
                </a>
                <a
                  href="https://github.com/kaorii-ako/Shiori-v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', background: `${T.blue}10`, border: `1px solid ${T.blue}30`, color: T.blue, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12 }}
                >
                  ⭐ Star on GitHub
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Semester report card trigger */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setShowSemesterCard(true)}
          style={{ width: '100%', padding: '18px', borderRadius: 12, cursor: 'pointer', background: `linear-gradient(135deg, ${T.orange}0d, ${T.purpleVibrant}08)`, border: `1px solid ${T.orange}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        >
          <Trophy size={18} style={{ color: T.orange }} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.orange }}>
              Generate Semester Report Card
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint, marginTop: 2 }}>
              Shareable PNG with all your stats
            </p>
          </div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showSemesterCard && <SemesterCard onClose={() => setShowSemesterCard(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default Analytics
