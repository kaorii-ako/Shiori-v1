import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, BarChart3, FileText, CheckCircle2,
  Target, Puzzle, Layers, ArrowRight, Zap,
} from 'lucide-react'
import { useAuthStore, useAssignmentsStore, useGradesStore, useNotesStore, useXPStore, useUIStore, pctToGPA } from '../stores'
import { C, fonts, tint } from '../utils/theme'
import { StatCard, SectionTitle, Card } from '../components/ui'
import { GoogleLogo } from '../components/GoogleButton'

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

  const quickActions = [
    { icon: Target, label: 'Start Focus Mode', path: '/focus', color: C.blue },
    { icon: Puzzle, label: 'Take a Quiz', path: '/quiz', color: C.purple },
    { icon: Layers, label: 'Review Flashcards', path: '/flashcards', color: C.green },
    { icon: BarChart3, label: 'Check Grades', path: '/grades', color: C.orange },
  ]

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 1020, margin: '0 auto' }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {greeting}, {name} <span aria-hidden="true">👋</span>
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted }}>{today}</p>
      </div>

      {/* XP Bar */}
      <Card style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9, gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: xpLevel?.color || C.blue }}>
            <Zap size={14} /> {xpLevel?.title || 'Freshman'} · Level {xpLevel?.level || 1}
          </span>
          <span style={{ fontSize: 12, color: C.textMuted }}>
            {xp} XP{xpNext ? ` · ${xpToNext - (xp - xpLevel.min)} to next level` : ' · Max level!'}
          </span>
        </div>
        <div style={{ height: 7, background: tint(C.blue, 0.1), borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${xpPct}%`,
            background: `linear-gradient(90deg, ${xpLevel?.color || C.blue}, ${xpNext?.color || C.blueDark})`,
            borderRadius: 4, transition: 'width 0.4s ease',
            boxShadow: `0 0 12px ${tint(xpLevel?.color || C.blue, 0.5)}`,
          }} />
        </div>
      </Card>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={ClipboardList} label="Due today" value={todayAssignments.length} color={todayAssignments.length > 0 ? C.pink : C.green} />
        <StatCard icon={BarChart3} label="Current GPA" value={currentGPA} color={C.blue} />
        <StatCard icon={FileText} label="Notes" value={notes?.length || 0} color={C.purple} />
        <StatCard icon={CheckCircle2} label="Completed" value={(assignments || []).filter(a => a.completed).length} color={C.green} />
      </div>

      <div className="grid-2">
        {/* Upcoming assignments */}
        <Card>
          <SectionTitle
            icon={ClipboardList}
            color={C.pink}
            action={
              <button onClick={() => navigate('/assignments')} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: fonts.body, fontWeight: 600,
              }}>View all <ArrowRight size={12} /></button>
            }
          >Upcoming</SectionTitle>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
                {connected ? 'No upcoming assignments 🎉' : 'Connect Google Classroom to auto-import your assignments.'}
              </p>
              <button onClick={handleSync} disabled={syncing} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 10, border: 'none',
                background: '#fff', color: '#1f1f1f', cursor: syncing ? 'not-allowed' : 'pointer',
                fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
              }}>
                <GoogleLogo size={15} /> {syncing ? 'Syncing…' : connected ? 'Sync Classroom now' : 'Connect Classroom'}
              </button>
            </div>
          ) : (
            upcoming.map(a => {
              const due = new Date(a.dueDate)
              const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={a.id} className="hover-row" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 8px', margin: '0 -8px',
                  borderBottom: `1px solid ${C.borderSoft}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: daysLeft <= 1 ? C.pink : daysLeft <= 3 ? C.orange : C.green,
                    boxShadow: `0 0 8px ${tint(daysLeft <= 1 ? C.pink : daysLeft <= 3 ? C.orange : C.green, 0.6)}`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.textFaint }}>{a.course || a.courseName}</div>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: daysLeft <= 1 ? C.pink : C.textMuted, flexShrink: 0 }}>
                    {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                  </div>
                </div>
              )
            })
          )}
        </Card>

        {/* Recent notes */}
        <Card>
          <SectionTitle
            icon={FileText}
            color={C.purple}
            action={
              <button onClick={() => navigate('/notes')} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: fonts.body, fontWeight: 600,
              }}>View all <ArrowRight size={12} /></button>
            }
          >Recent Notes</SectionTitle>
          {recentNotes.length === 0 ? (
            <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>
              No notes yet. Start writing! ✍️
            </p>
          ) : (
            recentNotes.map(n => (
              <div key={n.id} className="hover-row" style={{
                padding: '10px 8px', margin: '0 -8px',
                borderBottom: `1px solid ${C.borderSoft}`, cursor: 'pointer',
              }} onClick={() => navigate('/notes')}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.title || 'Untitled'}</div>
                <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 2 }}>
                  {(n.content || '').slice(0, 60)}{n.content?.length > 60 ? '…' : ''}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={Zap} color={C.yellow}>Quick Actions</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {quickActions.map(a => {
            const Icon = a.icon
            return (
              <button key={a.path} onClick={() => navigate(a.path)} className="hover-lift" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 20px', borderRadius: 12,
                border: `1px solid ${tint(a.color, 0.25)}`,
                background: tint(a.color, 0.07), color: a.color,
                cursor: 'pointer', fontFamily: fonts.heading,
                fontSize: 13, fontWeight: 600,
              }}>
                <Icon size={16} strokeWidth={2.2} /> {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
