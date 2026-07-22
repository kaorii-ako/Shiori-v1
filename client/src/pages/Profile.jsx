import { useMemo } from 'react'
import { User, Zap, Medal, Flame, CheckCircle2, FileText, Target } from 'lucide-react'
import { useAuthStore, useAssignmentsStore, useNotesStore, useXPStore, usePomodoroStore, calcStreak } from '../stores'
import { C, fonts, tint } from '../utils/theme'
import { PageHeader, Card, StatCard } from '../components/ui'

const BADGES = [
  { icon: Flame, color: '#ffc88a', label: 'On Fire', desc: '7-day streak', req: s => s.streak >= 7 },
  { icon: FileText, color: '#d9a9ff', label: 'Note Taker', desc: '10+ notes', req: s => s.notes >= 10 },
  { icon: CheckCircle2, color: '#a6f0a0', label: 'Finisher', desc: '20 assignments done', req: s => s.completed >= 20 },
  { icon: Zap, color: '#9db8ff', label: 'XP Hunter', desc: '500+ XP', req: s => s.xp >= 500 },
  { icon: Medal, color: '#ffe08a', label: 'Level Up', desc: 'Reached Level 5', req: s => s.level >= 5 },
  { icon: Target, color: '#ff7aa8', label: 'Focused', desc: 'Used Focus Mode', req: s => s.totalFocusMinutes >= 25 },
]

export default function Profile() {
  const { user } = useAuthStore()
  const { assignments } = useAssignmentsStore()
  const { notes } = useNotesStore()
  const xpStore = useXPStore()
  const xp = xpStore?.xp || 0
  const { cur: xpLevel } = xpStore.getProgress()
  const level = xpLevel?.level || 1

  const { dailyFocusLog, totalFocusMinutes } = usePomodoroStore()
  const streak = calcStreak(dailyFocusLog || {})

  const completed = useMemo(() => (assignments || []).filter(a => a.completed).length, [assignments])
  const noteCount = (notes || []).length

  const stats = { streak, notes: noteCount, completed, xp, level, totalFocusMinutes: totalFocusMinutes || 0 }

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || 'Student'
  const userInitial = userName[0]?.toUpperCase() || 'S'

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        icon={User}
        accent={C.purple}
        title="Profile"
        subtitle="Your stats and achievements"
      />

      {/* Avatar + name */}
      <Card style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {user?.picture ? (
          <img
            src={user.picture}
            alt={userName}
            style={{ width: 80, height: 80, borderRadius: 20, flexShrink: 0, objectFit: 'cover', border: `2px solid ${tint(C.blue, 0.3)}` }}
          />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: C.blueDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.heading, fontWeight: 700, fontSize: 32, color: '#0b0e14',
            boxShadow: `0 8px 28px ${tint(C.blueDark, 0.3)}`,
          }}>{userInitial}</div>
        )}
        <div>
          <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: C.text }}>{userName}</div>
          {user?.email && (
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{user.email}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <span style={{
              padding: '3px 12px', borderRadius: 999, background: tint(C.blue, 0.1),
              border: `1px solid ${tint(C.blue, 0.4)}`, fontSize: 12, color: C.blue,
              fontFamily: fonts.heading, fontWeight: 700,
            }}>Level {level}</span>
            {streak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.orange, fontWeight: 700 }}>
                <Flame size={13} /> {streak}d streak
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard icon={Zap} label="Total XP" value={xp} color={C.blue} />
        <StatCard icon={Medal} label="Level" value={level} color={C.purple} />
        <StatCard icon={Flame} label="Streak" value={`${streak}d`} color={C.orange} />
        <StatCard icon={CheckCircle2} label="Done" value={completed} color={C.green} />
        <StatCard icon={FileText} label="Notes" value={noteCount} color={C.pink} />
      </div>

      {/* Badges */}
      <Card style={{ padding: '20px 24px' }}>
        <h2 style={{
          fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: C.textFaint,
          letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase',
        }}>Achievements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {BADGES.map(b => {
            const earned = b.req(stats)
            const Icon = b.icon
            return (
              <div key={b.label} style={{
                padding: 16, borderRadius: 14,
                background: earned ? tint(b.color, 0.07) : 'transparent',
                border: `1px solid ${earned ? tint(b.color, 0.35) : C.borderSoft}`,
                opacity: earned ? 1 : 0.4,
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}>
                <Icon size={26} color={earned ? b.color : C.textFaint} style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: earned ? C.text : C.textMuted }}>{b.label}</div>
                <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{b.desc}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
