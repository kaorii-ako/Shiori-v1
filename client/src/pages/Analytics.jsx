import { useMemo } from 'react'
import { useAssignmentsStore, useGradesStore, useXPStore } from '../stores'
import { C } from '../utils/theme'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Analytics() {
  const { assignments } = useAssignmentsStore()
  const { semesters } = useGradesStore()
  const xpStore = useXPStore?.()
  const xp = xpStore?.xp || 0
  const level = xpStore?.level || 1
  const streak = xpStore?.streak || 0

  const completed = useMemo(() => (assignments||[]).filter(a=>a.completed).length, [assignments])
  const total = (assignments||[]).length
  const completionRate = total > 0 ? Math.round((completed/total)*100) : 0

  const allCourses = useMemo(() => (semesters||[]).flatMap(s=>s.courses||[]), [semesters])
  const overallGPA = useMemo(() => {
    const gpas = allCourses.filter(c=>c.gpa!=null).map(c=>c.gpa)
    if (!gpas.length) return null
    return (gpas.reduce((a,b)=>a+b,0)/gpas.length).toFixed(2)
  }, [allCourses])

  // Mock weekly study hours for chart
  const weeklyHours = [2.5, 4, 3, 5, 1.5, 6, 3.5]
  const maxH = Math.max(...weeklyHours)

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
          <div style={{ display:'flex',alignItems:'flex-end',gap:10,height:120 }}>
            {weeklyHours.map((h,i) => (
              <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                <div style={{ fontSize:10,color:C.textMuted }}>{h}h</div>
                <div style={{
                  width:'100%',
                  height: maxH > 0 ? `${(h/maxH)*90}px` : '4px',
                  background:'linear-gradient(180deg,#afc6ff,#528dff)',
                  borderRadius:'4px 4px 0 0',
                  transition:'height 0.3s ease',
                }} />
                <div style={{ fontSize:10,color:C.textMuted }}>{DAYS[i]}</div>
              </div>
            ))}
          </div>
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
      {allCourses.length > 0 && (
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:16 }}>Grade Trends by Course</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {allCourses.map((c,i) => {
              const pct = c.percentage ?? c.grade ?? 0
              const color = pct>=80?C.green:pct>=70?C.orange:C.pink
              return (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:140,fontSize:13,color:C.text,flexShrink:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{c.name}</div>
                  <div style={{ flex:1,height:8,background:C.border,borderRadius:4,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${pct}%`,background:color,borderRadius:4 }} />
                  </div>
                  <div style={{ width:40,fontSize:12,color,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",textAlign:'right' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
