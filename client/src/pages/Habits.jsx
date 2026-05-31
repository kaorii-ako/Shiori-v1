import { useState } from 'react'
import { C } from '../utils/theme'

const WEEK_DAYS = ['M','T','W','T','F','S','S']
const COLORS = [C.blue, C.purple, C.green, C.pink, C.orange]

const defaultHabits = [
  { id:'1', name:'Read for 20 mins', streak:5, color:C.blue, completedDays:[true,true,false,true,true,false,false] },
  { id:'2', name:'Exercise', streak:3, color:C.green, completedDays:[false,true,true,true,false,false,false] },
  { id:'3', name:'Review notes', streak:7, color:C.purple, completedDays:[true,true,true,true,true,true,false] },
]

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:28,width:'min(420px,90vw)' }}>
        {children}
      </div>
    </div>
  )
}

export default function Habits() {
  const [habits, setHabits] = useState(defaultHabits)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', color:C.blue })
  const todayIdx = (new Date().getDay() + 6) % 7 // 0=Mon

  const toggleToday = (id) => {
    setHabits(hs => hs.map(h => {
      if (h.id !== id) return h
      const days = [...h.completedDays]
      days[todayIdx] = !days[todayIdx]
      const streak = days[todayIdx] ? h.streak + 1 : Math.max(0, h.streak - 1)
      return { ...h, completedDays: days, streak }
    }))
  }

  const deleteHabit = (id) => setHabits(hs => hs.filter(h => h.id !== id))

  const addHabit = () => {
    if (!form.name.trim()) return
    setHabits(hs => [...hs, {
      id: Date.now().toString(), name: form.name, streak: 0,
      color: form.color, completedDays: [false,false,false,false,false,false,false],
    }])
    setForm({ name:'', color:C.blue })
    setShowModal(false)
  }

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:700,margin:'0 auto' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700 }}>✅ Habits</h1>
        <button onClick={()=>setShowModal(true)} style={{ padding:'9px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>+ Add Habit</button>
      </div>

      {/* Week header */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 20px',marginBottom:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          <div style={{ flex:1 }} />
          {WEEK_DAYS.map((d,i) => (
            <div key={i} style={{
              width:32,textAlign:'center',
              fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",
              color: i===todayIdx ? C.blue : C.textMuted,
            }}>{d}</div>
          ))}
          <div style={{ width:60 }} />
        </div>
      </div>

      {habits.length === 0 ? (
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'40px 20px',textAlign:'center' }}>
          <div style={{ fontSize:40,marginBottom:12 }}>✅</div>
          <p style={{ color:C.textMuted,fontSize:14 }}>No habits yet. Build your first one!</p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {habits.map(h => (
            <div key={h.id} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',gap:4 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:600,color:C.text }}>{h.name}</div>
                <div style={{ fontSize:11,color:h.color,marginTop:2 }}>🔥 {h.streak} day streak</div>
              </div>
              {h.completedDays.map((done,i) => (
                <button key={i} onClick={i===todayIdx ? ()=>toggleToday(h.id) : undefined}
                  style={{
                    width:28,height:28,borderRadius:6,
                    border:`1px solid ${done ? h.color : C.border}`,
                    background: done ? `${h.color}33` : 'transparent',
                    cursor: i===todayIdx ? 'pointer' : 'default',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:12,
                    opacity: i > todayIdx ? 0.4 : 1,
                  }}
                >{done ? '✓' : ''}</button>
              ))}
              <button onClick={()=>deleteHabit(h.id)} style={{ marginLeft:8,background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:14,padding:4 }}
                onMouseEnter={e=>e.currentTarget.style.color=C.pink}
                onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:18 }}>New Habit</h2>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:6,fontWeight:600 }}>Habit Name</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Read 20 minutes"
            style={{ width:'100%',padding:'9px 12px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:13,fontFamily:"'Manrope',sans-serif",boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:8,fontWeight:600 }}>Color</label>
          <div style={{ display:'flex',gap:8 }}>
            {COLORS.map(col => (
              <button key={col} onClick={()=>setForm(f=>({...f,color:col}))} style={{ width:26,height:26,borderRadius:'50%',background:col,border:form.color===col?'2px solid white':'2px solid transparent',cursor:'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={()=>setShowModal(false)} style={{ padding:'9px 18px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>Cancel</button>
          <button onClick={addHabit} style={{ padding:'9px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>Add Habit</button>
        </div>
      </Modal>
    </div>
  )
}
