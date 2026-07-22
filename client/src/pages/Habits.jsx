import { useState, useEffect } from 'react'
import { CheckCircle2, Plus, Flame, Check, Trash2 } from 'lucide-react'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost } from '../utils/theme'
import { PageHeader, Card, Empty } from '../components/ui'

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const COLORS = [C.blue, C.purple, C.green, C.pink, C.orange]
const STORAGE_KEY = 'shiori-habits'

const defaultHabits = [
  { id: '1', name: 'Read for 20 mins', streak: 5, color: C.blue, completedDays: [true, true, false, true, true, false, false] },
  { id: '2', name: 'Exercise', streak: 3, color: C.green, completedDays: [false, true, true, true, false, false, false] },
  { id: '3', name: 'Review notes', streak: 7, color: C.purple, completedDays: [true, true, true, true, true, true, false] },
]

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted storage — fall back to defaults */ }
  return defaultHabits
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(4,6,10,0.85)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} className="page-enter" style={{
        background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, width: 'min(420px,92vw)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function Habits() {
  const [habits, setHabits] = useState(loadHabits)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', color: C.blue })
  const todayIdx = (new Date().getDay() + 6) % 7 // 0=Mon

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)) } catch { /* storage full */ }
  }, [habits])

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
      color: form.color, completedDays: [false, false, false, false, false, false, false],
    }])
    setForm({ name: '', color: C.blue })
    setShowModal(false)
  }

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        icon={CheckCircle2}
        accent={C.green}
        title="Habits"
        subtitle="Small daily wins, big results"
        actions={
          <button onClick={() => setShowModal(true)} style={btnPrimary}>
            <Plus size={15} /> Add Habit
          </button>
        }
      />

      {/* Week header */}
      <Card style={{ padding: '12px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1 }} />
          {WEEK_DAYS.map((d, i) => (
            <div key={i} style={{
              width: 32, textAlign: 'center',
              fontSize: 11, fontWeight: 700, fontFamily: fonts.heading,
              color: i === todayIdx ? C.blue : C.textFaint,
            }}>{d}</div>
          ))}
          <div style={{ width: 60 }} />
        </div>
      </Card>

      {habits.length === 0 ? (
        <Card style={{ padding: 0 }}>
          <Empty
            icon={CheckCircle2}
            accent={C.green}
            title="No habits yet"
            description="Build your first daily habit — reading, exercise, reviewing notes — and keep the streak alive."
            action={() => setShowModal(true)}
            actionLabel="Add your first habit"
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {habits.map(h => (
            <div key={h.id} className="hover-lift" style={{
              background: C.card,
              border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{h.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: h.color, marginTop: 3, fontWeight: 700 }}>
                  <Flame size={12} /> {h.streak} day streak
                </div>
              </div>
              {h.completedDays.map((done, i) => (
                <button key={i} onClick={i === todayIdx ? () => toggleToday(h.id) : undefined}
                  aria-label={i === todayIdx ? 'Toggle today' : undefined}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: `1px solid ${done ? tint(h.color, 0.6) : C.border}`,
                    background: done ? tint(h.color, 0.18) : 'transparent',
                    cursor: i === todayIdx ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: h.color,
                    opacity: i > todayIdx ? 0.35 : 1,
                    transition: 'all 0.15s ease',
                    boxShadow: i === todayIdx ? `0 0 0 1px ${tint(h.color, 0.3)}` : 'none',
                  }}
                >{done ? <Check size={13} strokeWidth={3} /> : ''}</button>
              ))}
              <button onClick={() => deleteHabit(h.id)} aria-label="Delete habit" style={{
                marginLeft: 8, background: 'none', border: 'none', color: C.textFaint,
                cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.15s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.pink}
                onMouseLeave={e => e.currentTarget.style.color = C.textFaint}
              ><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 18 }}>New Habit</h2>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>Habit Name</label>
          <input
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Read 20 minutes"
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = C.blueDark }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, fontWeight: 700 }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(col => (
              <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} aria-label={`Color ${col}`} style={{
                width: 26, height: 26, borderRadius: '50%', background: col,
                border: form.color === col ? '2px solid white' : '2px solid transparent', cursor: 'pointer',
                boxShadow: form.color === col ? `0 0 12px ${tint(col, 0.6)}` : 'none',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(false)} style={{ ...btnGhost, color: C.textMuted }}>Cancel</button>
          <button onClick={addHabit} style={btnPrimary}>Add Habit</button>
        </div>
      </Modal>
    </div>
  )
}
