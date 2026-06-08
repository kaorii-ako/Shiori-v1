import { useMemo } from 'react'
import { useAuthStore, useAssignmentsStore, useNotesStore, useXPStore, usePomodoroStore, calcStreak } from '../stores'
import { C } from '../utils/theme'

const BADGES = [
  { icon: '🔥', label: 'On Fire', desc: '7-day streak', req: s => s.streak >= 7 },
  { icon: '📝', label: 'Note Taker', desc: '10+ notes', req: s => s.notes >= 10 },
  { icon: '✅', label: 'Finisher', desc: '20 assignments done', req: s => s.completed >= 20 },
  { icon: '⚡', label: 'XP Hunter', desc: '500+ XP', req: s => s.xp >= 500 },
  { icon: '🏅', label: 'Level Up', desc: 'Reached Level 5', req: s => s.level >= 5 },
  { icon: '🎯', label: 'Focused', desc: 'Used Focus Mode', req: s => s.totalFocusMinutes >= 25 },
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
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>👤 Profile</h1>

      {/* Avatar + name */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        {user?.picture ? (
          <img
            src={user.picture}
            alt={userName}
            style={{ width: 80, height: 80, borderRadius: 16, flexShrink: 0, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: 80, height: 80, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg,#afc6ff,#528dff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: '#10141a',
          }}>{userInitial}</div>
        )}
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: C.text }}>{userName}</div>
          {user?.email && (
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{user.email}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(175,198,255,0.15)', border: `1px solid ${C.blue}`, fontSize: 12, color: C.blue, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Level {level}</span>
            {streak > 0 && (
              <span style={{ fontSize: 13, color: C.orange }}>🔥 {streak}d streak</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total XP', value: xp, icon: '⚡', color: C.blue },
          { label: 'Current Level', value: level, icon: '🏅', color: C.purple },
          { label: 'Study Streak', value: `${streak}d`, icon: '🔥', color: C.orange },
          { label: 'Assignments Done', value: completed, icon: '✅', color: C.green },
          { label: 'Notes Created', value: noteCount, icon: '📝', color: C.blue },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>Achievements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {BADGES.map(b => {
            const earned = b.req(stats)
            return (
              <div key={b.label} style={{
                padding: '14px', borderRadius: 10,
                background: earned ? 'rgba(175,198,255,0.08)' : 'transparent',
                border: `1px solid ${earned ? C.blue : C.border}`,
                opacity: earned ? 1 : 0.4,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: earned ? C.text : C.textMuted }}>{b.label}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{b.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
