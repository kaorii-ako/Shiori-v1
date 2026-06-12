import { useState, useMemo } from 'react'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useEventStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost } from '../utils/theme'
import { PageHeader, Card, SectionTitle } from '../components/ui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(4,6,10,0.75)', backdropFilter: 'blur(3px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} className="page-enter" style={{
        background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
        border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, width: 'min(440px,92vw)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function Calendar() {
  const { events, addEvent, deleteEvent } = useEventStore()
  const [date, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '', color: C.blue })

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

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
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8)
  }, [events])

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return
    addEvent({ ...form, id: Date.now().toString() })
    setForm({ title: '', date: '', time: '', color: C.blue })
    setShowModal(false)
  }

  const prevMonth = () => setDate(new Date(year, month - 1, 1))
  const nextMonth = () => setDate(new Date(year, month + 1, 1))
  const today = new Date()

  const navBtn = {
    background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 9,
    color: C.textMuted, cursor: 'pointer', padding: 6, display: 'flex',
    transition: 'color 0.15s ease, border-color 0.15s ease',
  }

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 1020, margin: '0 auto' }}>
      <PageHeader
        icon={CalendarDays}
        accent={C.orange}
        title="Calendar"
        subtitle="Tests, deadlines and everything in between"
        actions={
          <button onClick={() => setShowModal(true)} style={btnPrimary}>
            <Plus size={15} /> Add Event
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Calendar grid */}
        <Card style={{ flex: 1, minWidth: 300 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={prevMonth} aria-label="Previous month" style={navBtn}
              onMouseEnter={e => { e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            ><ChevronLeft size={16} /></button>
            <span style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: C.text }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} aria-label="Next month" style={navBtn}
              onMouseEnter={e => { e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            ><ChevronRight size={16} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.textFaint, padding: '4px 0', fontFamily: fonts.heading, letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              const isToday = d && today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
              const dayEvents = d ? (eventsByDay[d] || []) : []
              return (
                <div key={i} style={{
                  minHeight: 58, padding: '6px 4px', borderRadius: 9,
                  background: isToday ? tint(C.blue, 0.1) : 'transparent',
                  border: isToday ? `1px solid ${tint(C.blue, 0.4)}` : '1px solid transparent',
                  transition: 'background 0.13s ease',
                }}>
                  {d && (
                    <>
                      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? C.blue : C.text, marginBottom: 3 }}>{d}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {dayEvents.slice(0, 2).map(e => (
                          <div key={e.id} style={{
                            fontSize: 9, padding: '1.5px 4px', borderRadius: 4,
                            background: tint(e.color || C.blue, 0.18), color: e.color || C.blue,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600,
                          }}>
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div style={{ fontSize: 9, color: C.textFaint, paddingLeft: 4 }}>+{dayEvents.length - 2}</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Upcoming sidebar */}
        <Card style={{ width: 240, flexShrink: 0, alignSelf: 'flex-start', padding: 18 }}>
          <SectionTitle icon={CalendarDays} color={C.orange}>Upcoming</SectionTitle>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: 12.5, color: C.textMuted }}>No upcoming events. Add tests, club meetings or deadlines.</p>
          ) : upcoming.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.borderSoft}` }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: e.color || C.blue, marginTop: 4, flexShrink: 0,
                boxShadow: `0 0 8px ${tint(e.color || C.blue, 0.6)}`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{e.title}</div>
                <div style={{ fontSize: 10.5, color: C.textFaint }}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{e.time ? ` · ${e.time}` : ''}</div>
              </div>
              <button onClick={() => deleteEvent(e.id)} aria-label="Delete event" style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', flexShrink: 0, padding: 2, display: 'flex' }}
                onMouseEnter={ev => ev.currentTarget.style.color = C.pink}
                onMouseLeave={ev => ev.currentTarget.style.color = C.textFaint}
              ><Trash2 size={12} /></button>
            </div>
          ))}
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 18 }}>New Event</h2>
        {[
          { label: 'Title', key: 'title', type: 'text', placeholder: 'Event name' },
          { label: 'Date', key: 'date', type: 'date', placeholder: '' },
          { label: 'Time', key: 'time', type: 'time', placeholder: '' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = C.blueDark }}
              onBlur={e => { e.target.style.borderColor = C.border }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[C.blue, C.purple, C.green, C.pink, C.orange].map(col => (
              <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} aria-label={`Color ${col}`} style={{
                width: 26, height: 26, borderRadius: '50%', background: col,
                border: form.color === col ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer',
                boxShadow: form.color === col ? `0 0 12px ${tint(col, 0.6)}` : 'none',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(false)} style={{ ...btnGhost, color: C.textMuted }}>Cancel</button>
          <button onClick={handleAdd} style={btnPrimary}>Add Event</button>
        </div>
      </Modal>
    </div>
  )
}
