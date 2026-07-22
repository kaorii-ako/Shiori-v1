import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useAssignmentsStore, useAuthStore, useUIStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost, chip } from '../utils/theme'
import { PageHeader, Empty } from '../components/ui'
import { GoogleLogo } from '../components/GoogleButton'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_COLOR = { low: C.green, medium: C.orange, high: C.pink }
const EMPTY = { title: '', course: '', dueDate: '', priority: 'medium', notes: '' }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(4,6,10,0.85)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} className="page-enter" style={{
        background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 18,
        padding: 28, width: 'min(480px, 92vw)', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function Assignments() {
  const navigate = useNavigate()
  const { assignments, addAssignment, updateAssignment, deleteAssignment, syncClassroom, syncing } = useAssignmentsStore()
  const { isGoogleConnected, loginWithGoogle } = useAuthStore()
  const { addToast } = useUIStore()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const connected = isGoogleConnected()

  const handleSync = async () => {
    if (!connected) { navigate('/settings'); return }
    try {
      const r = await syncClassroom()
      addToast({ type: 'success', message: `Imported ${r.assignments} assignments from Classroom` })
    } catch (e) {
      if (e?.name === 'ClassroomAuthError') { addToast({ type: 'error', message: 'Google session expired — reconnecting…' }); loginWithGoogle().catch(() => {}) }
      else addToast({ type: 'error', message: e?.message || 'Classroom sync failed' })
    }
  }

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
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 820, margin: '0 auto' }}>
      <PageHeader
        icon={ClipboardList}
        accent={C.pink}
        title="Assignments"
        subtitle="Everything due, across every class"
        actions={
          <>
            <button onClick={handleSync} disabled={syncing} title="Import from Google Classroom" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 14px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#1f1f1f',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
            }}>
              <GoogleLogo size={15} /> {syncing ? 'Syncing…' : connected ? 'Sync Classroom' : 'Connect Classroom'}
            </button>
            <button onClick={() => setShowModal(true)} style={btnPrimary}>
              <Plus size={15} /> Add
            </button>
          </>
        }
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '6px 16px', borderRadius: 999,
            border: `1px solid ${filter === t.key ? tint(C.blue, 0.4) : C.border}`,
            background: filter === t.key ? tint(C.blue, 0.12) : 'transparent',
            color: filter === t.key ? C.blue : C.textMuted,
            cursor: 'pointer', fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
            transition: 'all 0.15s ease',
          }}>{t.label}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`, borderRadius: 16,
        }}>
          <Empty
            icon={ClipboardList}
            accent={C.pink}
            title={filter === 'all' ? 'No assignments yet' : 'Nothing here'}
            description={filter === 'all'
              ? 'Import everything from Google Classroom, or add one manually.'
              : 'No assignments match this filter. Nice work staying on top of things!'}
          />
          {filter === 'all' && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px 36px' }}>
              <button onClick={handleSync} disabled={syncing} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: '#fff', color: '#1f1f1f', cursor: syncing ? 'not-allowed' : 'pointer',
                fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
              }}><GoogleLogo size={16} /> {connected ? 'Sync Google Classroom' : 'Connect Google Classroom'}</button>
              <button onClick={() => setShowModal(true)} style={btnGhost}>Add manually</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => {
            const due = new Date(a.dueDate)
            const overdue = due < new Date() && !a.completed
            const pColor = PRIORITY_COLOR[a.priority] || C.textMuted
            return (
              <div key={a.id} className="hover-lift" style={{
                background: C.card,
                border: `1px solid ${overdue ? tint(C.pink, 0.35) : C.border}`, borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                opacity: a.completed ? 0.5 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={!!a.completed}
                  onChange={() => updateAssignment(a.id, { completed: !a.completed })}
                  style={{ width: 17, height: 17, cursor: 'pointer', flexShrink: 0, accentColor: C.blueDark }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: C.text,
                    textDecoration: a.completed ? 'line-through' : 'none',
                  }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {a.course || a.courseName} · Due {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {overdue && <span style={{ color: C.pink, fontWeight: 700 }}>Overdue</span>}
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ color: C.blue, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        Classroom <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
                <span style={{ ...chip(pColor), textTransform: 'capitalize' }}>{a.priority || 'medium'}</span>
                <button onClick={() => deleteAssignment(a.id)} aria-label="Delete assignment" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.textFaint, flexShrink: 0, padding: 5, display: 'flex',
                  transition: 'color 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.pink}
                  onMouseLeave={e => e.currentTarget.style.color = C.textFaint}
                ><Trash2 size={15} /></button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>
          New Assignment
        </h2>
        {[
          { label: 'Title', key: 'title', placeholder: 'e.g. Chapter 5 Essay', type: 'text' },
          { label: 'Course', key: 'course', placeholder: 'e.g. English 101', type: 'text' },
          { label: 'Due Date', key: 'dueDate', placeholder: '', type: 'date' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = C.blueDark }}
              onBlur={e => { e.target.style.borderColor = C.border }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                padding: '7px 16px', borderRadius: 9,
                border: `1px solid ${form.priority === p ? tint(PRIORITY_COLOR[p], 0.5) : C.border}`,
                background: form.priority === p ? tint(PRIORITY_COLOR[p], 0.12) : 'transparent',
                color: form.priority === p ? PRIORITY_COLOR[p] : C.textMuted,
                cursor: 'pointer', fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
                textTransform: 'capitalize', transition: 'all 0.15s ease',
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>Notes</label>
          <textarea
            value={form.notes}
            placeholder="Optional notes..."
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => { e.target.style.borderColor = C.blueDark }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(false)} style={{ ...btnGhost, color: C.textMuted }}>Cancel</button>
          <button onClick={handleAdd} style={btnPrimary}>Add Assignment</button>
        </div>
      </Modal>
    </div>
  )
}
