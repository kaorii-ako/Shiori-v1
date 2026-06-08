import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAssignmentsStore, useGradesStore, useNotesStore, useXPStore, useUIStore, pctToGPA } from '../stores'
import { C } from '../utils/theme'
import { GoogleLogo } from '../components/GoogleButton'

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
  const { user, isGoogleConnected, loginWithGoogle } = useAuthStore()
  const { assignments, courses, syncClassroom, syncing } = useAssignmentsStore()
  const { addToast } = useUIStore()
  const connected = isGoogleConnected()

  const handleSync = async () => {
    if (!connected) { navigate('/settings'); return }
    try {
      const r = await syncClassroom()
      addToast({ type: 'success', message: `Synced ${r.courses} courses · ${r.assignments} assignments` })
    } catch (e) {
      if (e?.name === 'ClassroomAuthError') { addToast({ type: 'error', message: 'Google session expired — reconnecting…' }); loginWithGoogle().catch(() => {}) }
      else addToast({ type: 'error', message: e?.message || 'Classroom sync failed' })
    }
  }
  const { calculateCourseGrade, courseGrades } = useGradesStore()
  const { notes } = useNotesStore()
  const xpStore = useXPStore()
  const { pct: xpPct, cur: xpLevel, next: xpNext, xpToNext } = xpStore.getProgress()
  const xp = xpStore.xp

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

  const recentNotes = useMemo(() => (notes || []).slice(0, 3), [notes])

  const currentGPA = useMemo(() => {
    if (!courses?.length) return '—'
    let totalPoints = 0, totalCredits = 0
    courses.forEach(c => {
      const result = calculateCourseGrade(c.id)
      if (!result) return
      const cred = c.credits || 3
      totalPoints += pctToGPA(parseFloat(result.percentage)) * cred
      totalCredits += cred
    })
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—'
  }, [courses, courseGrades, calculateCourseGrade])

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {greeting}, {name}! 👋
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>{today}</p>
      </div>

      {/* XP Bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: xpLevel?.color || C.blue }}>
            {xpLevel?.title || 'Freshman'} · Level {xpLevel?.level || 1}
          </span>
          <span style={{ fontSize: 12, color: C.textMuted }}>
            {xp} XP{xpNext ? ` · ${xpToNext - (xp - xpLevel.min)} to next level` : ' · Max level!'}
          </span>
        </div>
        <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${xpPct}%`,
            background: `linear-gradient(90deg, ${xpLevel?.color || C.blue}, ${xpNext?.color || C.blue})`,
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
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
                {connected ? 'No upcoming assignments 🎉' : 'Connect Google Classroom to auto-import your assignments.'}
              </p>
              <button onClick={handleSync} disabled={syncing} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 9, border: 'none',
                background: '#fff', color: '#1f1f1f', cursor: syncing ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
              }}>
                <GoogleLogo size={15} /> {syncing ? 'Syncing…' : connected ? 'Sync Classroom now' : 'Connect Classroom'}
              </button>
            </div>
          ) : (
            upcoming.map(a => {
              const due = new Date(a.dueDate)
              const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: daysLeft <= 1 ? C.pink : daysLeft <= 3 ? C.orange : C.green,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{a.course || a.courseName}</div>
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
                padding: '10px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
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
            { label: '📊 Check Grades', path: '/grades', color: C.orange },
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
