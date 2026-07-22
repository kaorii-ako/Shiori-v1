import { useMemo } from 'react'
import { TrendingUp, Zap, Medal, Flame, BarChart3, Timer } from 'lucide-react'
import { useAssignmentsStore, useGradesStore, useXPStore, usePomodoroStore, pctToGPA, calcStreak } from '../stores'
import { C, fonts, tint } from '../utils/theme'
import { PageHeader, Card, StatCard, SectionTitle } from '../components/ui'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Analytics() {
  const { assignments, courses } = useAssignmentsStore()
  const gradesStore = useGradesStore()
  const xpStore = useXPStore()
  const { dailyFocusLog } = usePomodoroStore()

  const xp = xpStore?.xp || 0
  const progress = xpStore?.getProgress?.()
  const level = progress?.cur?.level || 1
  const streak = calcStreak(dailyFocusLog || {})

  const completed = useMemo(() => (assignments || []).filter(a => a.completed).length, [assignments])
  const total = (assignments || []).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const courseGradeData = useMemo(() => {
    return (courses || []).map(course => {
      const result = gradesStore.calculateCourseGrade?.(course.id)
      const pct = result != null ? Math.round(result) : null
      return { ...course, pct }
    }).filter(c => c.pct != null)
  }, [courses, gradesStore])

  const overallGPA = useMemo(() => {
    const gpas = courseGradeData.map(c => pctToGPA(c.pct))
    if (!gpas.length) return null
    return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)
  }, [courseGradeData])

  const weeklyHours = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().split('T')[0]
      const mins = (dailyFocusLog || {})[key] || 0
      return Math.round((mins / 60) * 10) / 10
    })
  }, [dailyFocusLog])

  const dayLabels = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
    })
  }, [])

  const maxH = Math.max(...weeklyHours, 0)
  const hasAnyHours = weeklyHours.some(h => h > 0)
  const completionColor = completionRate >= 80 ? C.green : completionRate >= 60 ? C.orange : C.pink

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 920, margin: '0 auto' }}>
      <PageHeader
        icon={TrendingUp}
        accent={C.blue}
        title="Analytics"
        subtitle="Your study patterns at a glance"
      />

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={Zap} label="Total XP" value={xp} color={C.blue} />
        <StatCard icon={Medal} label="Current Level" value={level} color={C.purple} />
        <StatCard icon={Flame} label="Study Streak" value={`${streak}d`} color={C.orange} />
        <StatCard icon={BarChart3} label="GPA" value={overallGPA || '—'} color={C.green} />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Weekly study time bar chart */}
        <Card>
          <SectionTitle icon={Timer} color={C.blue}>Weekly Study Time</SectionTitle>
          {hasAnyHours ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130 }}>
              {weeklyHours.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700 }}>{h > 0 ? `${h}h` : ''}</div>
                  <div style={{
                    width: '100%',
                    height: maxH > 0 ? `${Math.max((h / maxH) * 90, h > 0 ? 4 : 0)}px` : '4px',
                    background: C.blueDark,
                    borderRadius: '5px 5px 0 0',
                    transition: 'height 0.3s ease',
                    opacity: h > 0 ? 1 : 0.12,
                    boxShadow: h > 0 ? `0 0 16px ${tint(C.blueDark, 0.3)}` : 'none',
                  }} />
                  <div style={{ fontSize: 10, color: C.textFaint, fontFamily: fonts.heading, fontWeight: 600 }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130, flexDirection: 'column', gap: 10 }}>
              <Timer size={26} color={C.textFaint} />
              <div style={{ fontSize: 12.5, color: C.textMuted, textAlign: 'center' }}>Complete Pomodoro sessions to track focus time</div>
            </div>
          )}
        </Card>

        {/* Assignment completion */}
        <Card>
          <SectionTitle icon={BarChart3} color={C.green}>Assignment Completion</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, height: 130 }}>
            <div style={{
              fontFamily: fonts.heading, fontSize: 48, fontWeight: 700,
              color: completionColor,
              textShadow: `0 0 32px ${tint(completionColor, 0.35)}`,
            }}>
              {completionRate}%
            </div>
            <div style={{ height: 7, width: '100%', background: tint(completionColor, 0.1), borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionRate}%`, background: completionColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{completed} of {total} assignments completed</div>
          </div>
        </Card>
      </div>

      {/* Course grades */}
      {courseGradeData.length > 0 && (
        <Card>
          <SectionTitle icon={TrendingUp} color={C.purple}>Grade Trends by Course</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courseGradeData.map((c, i) => {
              const pct = c.pct
              const barColor = pct >= 80 ? C.green : pct >= 70 ? C.orange : C.pink
              return (
                <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 150, flexShrink: 0 }}>
                    {c.color && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    )}
                    <div style={{ fontSize: 13, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  </div>
                  <div style={{ flex: 1, height: 8, background: tint(barColor, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ width: 40, fontSize: 12, color: barColor, fontWeight: 700, fontFamily: fonts.heading, textAlign: 'right' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
