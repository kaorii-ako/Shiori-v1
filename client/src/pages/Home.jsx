import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAssignmentsStore, useGradesStore, useNotesStore, useXPStore } from '../stores'
import { C } from '../utils/theme'

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px',
      flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: color || C.text }}>{value}</div>
      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.textMuted, marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { assignments } = useAssignmentsStore()
  const { semesters } = useGradesStore()
  const { notes } = useNotesStore()
  const { xp, level, xpToNextLevel } = useXPStore?.() || { xp: 0, level: 1, xpToNextLevel: 100 }

  const name = user?.firstName || user?.name?.split(' ')[0] || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const todayAssignments = useMemo(() => {
    const todayStr = new Date().toDateString()
    return (assignments || []).filter(a => !a.completed && new Date(a.dueDate).toDateString() === todayStr)
  }, [assignments])

  const upcoming = useMemo(() => {
    return (assignments || [])
      .filter(a => !a.completed && new Date(a.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [assignments])

  const recentNotes = useMemo(() => {
    return (notes || []).slice(0, 3)
  }, [notes])

  const currentGPA = useMemo(() => {
    const all = (semesters || []).flatMap(s => s.courses || [])
    if (!all.length) return '—'
    const gpas = all.filter(c => c.gpa != null).map(c => c.gpa)
    if (!gpas.length) return '—'
    return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)
  }, [semesters])

  const xpPct = xpToNextLevel > 0 ? Math.min(100, Math.round((xp / xpToNextLevel) * 100)) : 0

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {greeting}, {name}! 👋
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>{today}</p>
      </div>

      {/* XP Bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: C.blue }}>
            Level {level}
          </span>
          <span style={{ fontSize: 12, color: C.textMuted }}>{xp} / {xpToNextLevel} XP</span>
        </div>
        <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${xpPct}%`,
            background: 'linear-gradient(90deg, #afc6ff, #528dff)',
            borderRadius: 4, transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard icon="📋" label="Due Today" value={todayAssignments.length} color={todayAssignments.length > 0 ? C.pink : C.green} />
        <StatCard icon="📊" label="Current GPA" value={currentGPA} color={C.blue} />
        <StatCard icon="📝" label="Notes" value={notes?.length || 0} color={C.purple} />
        <StatCard icon="✅" label="Completed" value={(assignments || []).filter(a => a.completed).length} color={C.green} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming assignments */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>
              📋 Upcoming
            </h2>
            <button onClick={() => navigate('/assignments')} style={{
              fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif",
            }}>View all →</button>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>
              No upcoming assignments 🎉
            </p>
          ) : (
            upcoming.map(a => {
              const due = new Date(a.dueDate)
              const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: daysLeft <= 1 ? C.pink : daysLeft <= 3 ? C.orange : C.green,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{a.course}</div>
                  </div>
                  <div style={{ fontSize: 11, color: daysLeft <= 1 ? C.pink : C.textMuted, flexShrink: 0 }}>
                    {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent notes */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>
              📝 Recent Notes
            </h2>
            <button onClick={() => navigate('/notes')} style={{
              fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif",
            }}>View all →</button>
          </div>
          {recentNotes.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>
              No notes yet. Start writing! ✍️
            </p>
          ) : (
            recentNotes.map(n => (
              <div key={n.id} style={{
                padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer',
              }} onClick={() => navigate('/notes')}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.title || 'Untitled'}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  {(n.content || '').slice(0, 60)}{n.content?.length > 60 ? '…' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '🎯 Start Focus Mode', path: '/focus', color: C.blue },
            { label: '🧩 Take a Quiz', path: '/quiz', color: C.purple },
            { label: '🃏 Review Flashcards', path: '/flashcards', color: C.green },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              padding: '12px 20px', borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.card, color: a.color,
              cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background = C.card}
            >{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
