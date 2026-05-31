import { useState, useMemo } from 'react'
import { useAssignmentsStore } from '../stores'
import { C } from '../utils/theme'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_COLOR = { low: C.green, medium: C.orange, high: C.pink }
const EMPTY = { title: '', course: '', dueDate: '', priority: 'medium', notes: '' }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: 28, width: 'min(480px, 90vw)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function Assignments() {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useAssignmentsStore()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const filtered = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7)
    return (assignments || []).filter(a => {
      if (filter === 'today') return new Date(a.dueDate).toDateString() === todayStr && !a.completed
      if (filter === 'week') return new Date(a.dueDate) <= weekEnd && !a.completed
      if (filter === 'overdue') return new Date(a.dueDate) < now && !a.completed
      return true
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [assignments, filter])

  const handleAdd = () => {
    if (!form.title.trim()) return
    addAssignment({ ...form, id: Date.now().toString(), completed: false, createdAt: new Date().toISOString() })
    setForm(EMPTY)
    setShowModal(false)
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'overdue', label: 'Overdue' },
  ]

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: C.text }}>
          📋 Assignments
        </h1>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 16px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #afc6ff, #528dff)',
          color: '#10141a', cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
        }}>+ Add Assignment</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === t.key ? C.blue : C.border}`,
            background: filter === t.key ? 'rgba(175,198,255,0.15)' : 'transparent',
            color: filter === t.key ? C.blue : C.textMuted,
            cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600,
          }}>{t.label}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '40px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: C.textMuted, fontSize: 14 }}>No assignments here. Add your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => {
            const due = new Date(a.dueDate)
            const overdue = due < new Date() && !a.completed
            return (
              <div key={a.id} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                opacity: a.completed ? 0.5 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={!!a.completed}
                  onChange={() => updateAssignment(a.id, { completed: !a.completed })}
                  style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: C.text,
                    textDecoration: a.completed ? 'line-through' : 'none',
                  }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                    {a.course} · Due {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {overdue && <span style={{ color: C.pink, marginLeft: 6 }}>Overdue</span>}
                  </div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: PRIORITY_COLOR[a.priority] || C.textMuted,
                  background: `${PRIORITY_COLOR[a.priority]}22`,
                }}>{a.priority || 'medium'}</span>
                <button onClick={() => deleteAssignment(a.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.textMuted, fontSize: 16, flexShrink: 0,
                  padding: 4,
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.pink}
                  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                >✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
          New Assignment
        </h2>
        {[
          { label: 'Title', key: 'title', placeholder: 'e.g. Chapter 5 Essay', type: 'text' },
          { label: 'Course', key: 'course', placeholder: 'e.g. English 101', type: 'text' },
          { label: 'Due Date', key: 'dueDate', placeholder: '', type: 'date' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                background: C.bg, border: `1px solid ${C.border}`,
                color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                padding: '6px 14px', borderRadius: 8, border: `1px solid ${form.priority === p ? PRIORITY_COLOR[p] : C.border}`,
                background: form.priority === p ? `${PRIORITY_COLOR[p]}22` : 'transparent',
                color: form.priority === p ? PRIORITY_COLOR[p] : C.textMuted,
                cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600,
                textTransform: 'capitalize',
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>Notes</label>
          <textarea
            value={form.notes}
            placeholder="Optional notes..."
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif",
              resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(false)} style={{
            padding: '9px 18px', borderRadius: 8, border: `1px solid ${C.border}`,
            background: 'transparent', color: C.textMuted, cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
          }}>Cancel</button>
          <button onClick={handleAdd} style={{
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #afc6ff, #528dff)',
            color: '#10141a', cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
          }}>Add Assignment</button>
        </div>
      </Modal>
    </div>
  )
}
