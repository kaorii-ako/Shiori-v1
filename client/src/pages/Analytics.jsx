import { useMemo } from 'react'
import { useAssignmentsStore, useGradesStore, useXPStore, usePomodoroStore, pctToGPA, calcStreak } from '../stores'
import { C } from '../utils/theme'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

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

  // Build per-course grade data from useGradesStore.calculateCourseGrade
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

  // Derive weekly study hours from dailyFocusLog (last 7 days, Sun–Sat aligned to today)
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

  // Labels for the last 7 days (Mon/Tue/… based on actual day of week)
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

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:900,margin:'0 auto' }}>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700,marginBottom:24 }}>📈 Analytics</h1>

      {/* Stats row */}
      <div style={{ display:'flex',gap:14,flexWrap:'wrap',marginBottom:24 }}>
        {[
          { label:'Total XP', value:xp, color:C.blue, icon:'⚡' },
          { label:'Current Level', value:level, color:C.purple, icon:'🏅' },
          { label:'Study Streak', value:`${streak}d`, color:C.orange, icon:'🔥' },
          { label:'GPA', value:overallGPA||'—', color:C.green, icon:'📊' },
        ].map(s => (
          <div key={s.label} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'16px 20px',flex:1,minWidth:140 }}>
            <div style={{ fontSize:22,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12,color:C.textMuted,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }}>
        {/* Weekly study time bar chart */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:18 }}>Weekly Study Time</h2>
          {hasAnyHours ? (
            <div style={{ display:'flex',alignItems:'flex-end',gap:10,height:120 }}>
              {weeklyHours.map((h, i) => (
                <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                  <div style={{ fontSize:10,color:C.textMuted }}>{h > 0 ? `${h}h` : ''}</div>
                  <div style={{
                    width:'100%',
                    height: maxH > 0 ? `${Math.max((h / maxH) * 90, h > 0 ? 4 : 0)}px` : '4px',
                    background:'linear-gradient(180deg,#afc6ff,#528dff)',
                    borderRadius:'4px 4px 0 0',
                    transition:'height 0.3s ease',
                    opacity: h > 0 ? 1 : 0.15,
                  }} />
                  <div style={{ fontSize:10,color:C.textMuted }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:120,flexDirection:'column',gap:8 }}>
              <div style={{ fontSize:28 }}>⏱️</div>
              <div style={{ fontSize:12,color:C.textMuted,textAlign:'center' }}>Complete Pomodoro sessions to track focus time</div>
            </div>
          )}
        </div>

        {/* Assignment completion */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:18 }}>Assignment Completion</h2>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,height:120 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:48,fontWeight:800,color:completionRate>=80?C.green:completionRate>=60?C.orange:C.pink }}>
              {completionRate}%
            </div>
            <div style={{ height:6,width:'100%',background:C.border,borderRadius:3,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${completionRate}%`,background:completionRate>=80?C.greenDark:completionRate>=60?C.orange:C.pink,borderRadius:3,transition:'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize:12,color:C.textMuted }}>{completed} of {total} assignments completed</div>
          </div>
        </div>
      </div>

      {/* Course grades */}
      {courseGradeData.length > 0 && (
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:16 }}>Grade Trends by Course</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {courseGradeData.map((c, i) => {
              const pct = c.pct
              const barColor = pct >= 80 ? C.green : pct >= 70 ? C.orange : C.pink
              return (
                <div key={c.id || i} style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,width:150,flexShrink:0 }}>
                    {c.color && (
                      <div style={{ width:8,height:8,borderRadius:'50%',background:c.color,flexShrink:0 }} />
                    )}
                    <div style={{ fontSize:13,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{c.name}</div>
                  </div>
                  <div style={{ flex:1,height:8,background:C.border,borderRadius:4,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${pct}%`,background:barColor,borderRadius:4,transition:'width 0.4s ease' }} />
                  </div>
                  <div style={{ width:40,fontSize:12,color:barColor,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",textAlign:'right' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
