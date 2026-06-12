import { useState } from 'react'
import { Trophy, Flame, Copy, Check, Users } from 'lucide-react'
import { useAuthStore, useXPStore } from '../stores'
import { C, fonts, tint, btnGhost } from '../utils/theme'
import { PageHeader, Card, SectionTitle } from '../components/ui'

const MOCK_BOARD = [
  { rank: 1, name: 'Alex Kim', xp: 4200, level: 12, streak: 21, avatar: 'A' },
  { rank: 2, name: 'Maria Chen', xp: 3850, level: 11, streak: 14, avatar: 'M' },
  { rank: 3, name: 'Jordan Lee', xp: 3400, level: 10, streak: 9, avatar: 'J' },
  { rank: 4, name: 'Sam Rivera', xp: 2900, level: 9, streak: 6, avatar: 'S' },
  { rank: 5, name: 'Taylor Wu', xp: 2400, level: 8, streak: 3, avatar: 'T' },
]

const RANK_EMOJI = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const { user } = useAuthStore()
  const xpStore = useXPStore?.()
  const myXP = xpStore?.xp || 0
  const myLevel = xpStore?.level || 1
  const myStreak = xpStore?.streak || 0
  const [shareCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase())
  const [copied, setCopied] = useState(false)

  const myName = user?.name || user?.firstName || 'You'
  const myInitial = myName[0]?.toUpperCase() || 'Y'

  const board = [...MOCK_BOARD, { rank: 6, name: myName + ' (You)', xp: myXP, level: myLevel, streak: myStreak, avatar: myInitial, isMe: true }]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const myEntry = board.find(e => e.isMe)

  const copyCode = () => {
    navigator.clipboard?.writeText(shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        icon={Trophy}
        accent={C.yellow}
        title="Leaderboard"
        subtitle="Compete with friends on XP and streaks"
      />

      {/* My rank card */}
      <Card style={{
        background: `linear-gradient(135deg, ${tint(C.blue, 0.08)}, ${tint(C.purpleDark, 0.06)})`,
        padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: fonts.heading, fontSize: 40, fontWeight: 700, color: C.blue,
          textShadow: `0 0 28px ${tint(C.blue, 0.4)}`,
        }}>#{myEntry?.rank}</div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{myName}</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Level {myLevel}</div>
        </div>
        {[
          { label: 'XP', value: myXP, color: C.blue },
          { label: 'Streak', value: `${myStreak}d`, color: C.orange },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{s.label}</div>
          </div>
        ))}
      </Card>

      {/* Board */}
      <Card style={{ overflow: 'hidden', marginBottom: 20, padding: 0 }}>
        {board.map((entry, i) => (
          <div key={entry.rank} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px',
            borderBottom: i < board.length - 1 ? `1px solid ${C.borderSoft}` : 'none',
            background: entry.isMe ? tint(C.blue, 0.06) : 'transparent',
            boxShadow: entry.isMe ? `inset 3px 0 0 ${C.blueDark}` : 'none',
          }}>
            <div style={{
              width: 30, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700,
              color: entry.rank <= 3 ? C.yellow : C.textFaint, textAlign: 'center', flexShrink: 0,
            }}>
              {RANK_EMOJI[entry.rank] || `#${entry.rank}`}
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: entry.isMe
                ? `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`
                : `linear-gradient(135deg, ${tint(C.textMuted, 0.3)}, ${tint(C.textMuted, 0.1)})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fonts.heading, fontWeight: 700, fontSize: 13,
              color: entry.isMe ? '#0b0e14' : C.text, flexShrink: 0,
            }}>
              {entry.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: entry.isMe ? 700 : 500, color: entry.isMe ? C.blue : C.text }}>{entry.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textFaint }}>
                Lv {entry.level} · <Flame size={10} color={C.orange} /> {entry.streak}d
              </div>
            </div>
            <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: C.text }}>{entry.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </Card>

      {/* Share code */}
      <Card style={{ padding: '20px 24px' }}>
        <SectionTitle icon={Users} color={C.purple}>Invite Friends</SectionTitle>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>Share your code to compete together:</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: C.blue,
            letterSpacing: '0.18em', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '8px 18px',
          }}>
            {shareCode}
          </div>
          <button onClick={copyCode} style={{ ...btnGhost, color: copied ? C.green : C.textMuted }}>
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      </Card>
    </div>
  )
}
