import { useState, useMemo } from 'react'
import { useEventStore } from '../stores'
import { C } from '../utils/theme'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:28,width:'min(440px,90vw)' }}>
        {children}
      </div>
    </div>
  )
}

export default function Calendar() {
  const { events, addEvent, deleteEvent } = useEventStore()
  const [date, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', date:'', time:'', color: C.blue })

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [firstDay, daysInMonth])

  const eventsByDay = useMemo(() => {
    const map = {}
    ;(events || []).forEach(e => {
      const d = new Date(e.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(e)
      }
    })
    return map
  }, [events, year, month])

  const upcoming = useMemo(() => {
    const now = new Date()
    return (events || [])
      .filter(e => new Date(e.date) >= now)
      .sort((a,b) => new Date(a.date)-new Date(b.date))
      .slice(0, 8)
  }, [events])

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return
    addEvent({ ...form, id: Date.now().toString() })
    setForm({ title:'', date:'', time:'', color: C.blue })
    setShowModal(false)
  }

  const prevMonth = () => setDate(new Date(year, month-1, 1))
  const nextMonth = () => setDate(new Date(year, month+1, 1))
  const today = new Date()

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:1000,margin:'0 auto' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700 }}>📅 Calendar</h1>
        <button onClick={()=>setShowModal(true)} style={{ padding:'9px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>+ Add Event</button>
      </div>

      <div style={{ display:'flex',gap:20 }}>
        {/* Calendar grid */}
        <div style={{ flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20 }}>
          {/* Month nav */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
            <button onClick={prevMonth} style={{ background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:18,padding:'0 8px' }}>‹</button>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:C.text }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:18,padding:'0 8px' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:'center',fontSize:11,fontWeight:700,color:C.textMuted,padding:'4px 0',fontFamily:"'Space Grotesk',sans-serif" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2 }}>
            {cells.map((d, i) => {
              const isToday = d && today.getDate()===d && today.getMonth()===month && today.getFullYear()===year
              const dayEvents = d ? (eventsByDay[d] || []) : []
              return (
                <div key={i} style={{
                  minHeight:56,padding:'6px 4px',borderRadius:8,
                  background: isToday ? 'rgba(175,198,255,0.15)' : 'transparent',
                  border: isToday ? `1px solid ${C.blue}` : '1px solid transparent',
                }}>
                  {d && (
                    <>
                      <div style={{ textAlign:'center',fontSize:12,fontWeight: isToday ? 700 : 400,color: isToday ? C.blue : C.text,marginBottom:3 }}>{d}</div>
                      <div style={{ display:'flex',flexDirection:'column',gap:1 }}>
                        {dayEvents.slice(0,2).map(e => (
                          <div key={e.id} style={{ fontSize:9,padding:'1px 3px',borderRadius:3,background:`${e.color||C.blue}33`,color:e.color||C.blue,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div style={{ fontSize:9,color:C.textMuted }}>+{dayEvents.length-2}</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div style={{ width:220,flexShrink:0,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,alignSelf:'flex-start' }}>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text,marginBottom:14 }}>Upcoming Events</h3>
          {upcoming.length === 0 ? (
            <p style={{ fontSize:12,color:C.textMuted }}>No upcoming events.</p>
          ) : upcoming.map(e => (
            <div key={e.id} style={{ display:'flex',gap:8,alignItems:'flex-start',marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:e.color||C.blue,marginTop:4,flexShrink:0 }} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:600,color:C.text }}>{e.title}</div>
                <div style={{ fontSize:10,color:C.textMuted }}>{new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}{e.time?` · ${e.time}`:''}</div>
              </div>
              <button onClick={()=>deleteEvent(e.id)} style={{ background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:11,flexShrink:0,padding:0 }}
                onMouseEnter={ev=>ev.currentTarget.style.color=C.pink}
                onMouseLeave={ev=>ev.currentTarget.style.color=C.textMuted}
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:18 }}>New Event</h2>
        {[
          { label:'Title', key:'title', type:'text', placeholder:'Event name' },
          { label:'Date', key:'date', type:'date', placeholder:'' },
          { label:'Time', key:'time', type:'time', placeholder:'' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:6,fontWeight:600 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
              onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
              style={{ width:'100%',padding:'9px 12px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:13,fontFamily:"'Manrope',sans-serif",boxSizing:'border-box' }} />
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:6,fontWeight:600 }}>Color</label>
          <div style={{ display:'flex',gap:8 }}>
            {[C.blue,C.purple,C.green,C.pink,C.orange].map(col => (
              <button key={col} onClick={()=>setForm(f=>({...f,color:col}))} style={{ width:24,height:24,borderRadius:'50%',background:col,border:form.color===col?`2px solid white`:'2px solid transparent',cursor:'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={()=>setShowModal(false)} style={{ padding:'9px 18px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>Cancel</button>
          <button onClick={handleAdd} style={{ padding:'9px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>Add Event</button>
        </div>
      </Modal>
    </div>
  )
}
