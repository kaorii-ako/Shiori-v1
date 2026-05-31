import { useState } from 'react'
import { useAuthStore, useXPStore } from '../stores'
import { C } from '../utils/theme'

const MOCK_BOARD = [
  { rank:1, name:'Alex Kim', xp:4200, level:12, streak:21, avatar:'A' },
  { rank:2, name:'Maria Chen', xp:3850, level:11, streak:14, avatar:'M' },
  { rank:3, name:'Jordan Lee', xp:3400, level:10, streak:9, avatar:'J' },
  { rank:4, name:'Sam Rivera', xp:2900, level:9, streak:6, avatar:'S' },
  { rank:5, name:'Taylor Wu', xp:2400, level:8, streak:3, avatar:'T' },
]

const RANK_COLORS = { 1: C.orange, 2: C.textMuted, 3: C.orange }
const RANK_EMOJI = { 1:'🥇', 2:'🥈', 3:'🥉' }

export default function Leaderboard() {
  const { user } = useAuthStore()
  const xpStore = useXPStore?.()
  const myXP = xpStore?.xp || 0
  const myLevel = xpStore?.level || 1
  const myStreak = xpStore?.streak || 0
  const [shareCode] = useState(() => Math.random().toString(36).slice(2,6).toUpperCase())

  const myName = user?.name || user?.firstName || 'You'
  const myInitial = myName[0]?.toUpperCase() || 'Y'

  const board = [...MOCK_BOARD, { rank: 6, name: myName+' (You)', xp: myXP, level: myLevel, streak: myStreak, avatar: myInitial, isMe: true }]
    .sort((a,b)=>b.xp-a.xp)
    .map((e,i)=>({ ...e, rank: i+1 }))

  const myEntry = board.find(e=>e.isMe)

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:700,margin:'0 auto' }}>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700,marginBottom:24 }}>🏆 Leaderboard</h1>

      {/* My rank card */}
      <div style={{ background:'linear-gradient(135deg,rgba(175,198,255,0.1),rgba(196,77,255,0.08))',border:`1px solid ${C.border}`,borderRadius:14,padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:20,flexWrap:'wrap' }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:40,fontWeight:800,color:C.blue }}>#{myEntry?.rank}</div>
        <div style={{ flex:1,minWidth:120 }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{myName}</div>
          <div style={{ fontSize:12,color:C.textMuted }}>Level {myLevel}</div>
        </div>
        {[
          { label:'XP', value:myXP, color:C.blue },
          { label:'Streak', value:`${myStreak}d`, color:C.orange },
        ].map(s=>(
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11,color:C.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden',marginBottom:20 }}>
        {board.map((entry,i) => (
          <div key={entry.rank} style={{
            display:'flex',alignItems:'center',gap:14,
            padding:'14px 20px',
            borderBottom: i<board.length-1 ? `1px solid ${C.border}` : 'none',
            background: entry.isMe ? 'rgba(175,198,255,0.06)' : 'transparent',
          }}>
            <div style={{ width:28,fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:RANK_COLORS[entry.rank]||C.textMuted,textAlign:'center',flexShrink:0 }}>
              {RANK_EMOJI[entry.rank] || `#${entry.rank}`}
            </div>
            <div style={{ width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${entry.isMe?C.blue:C.textMuted}66,${entry.isMe?C.blueDark:C.border})`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,color:C.text,flexShrink:0 }}>
              {entry.avatar}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:14,fontWeight: entry.isMe?700:500,color: entry.isMe?C.blue:C.text }}>{entry.name}</div>
              <div style={{ fontSize:11,color:C.textMuted }}>Lv {entry.level} · 🔥 {entry.streak}d</div>
            </div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:C.text }}>{entry.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>

      {/* Share code */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'20px 24px' }}>
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:C.text,marginBottom:8 }}>Invite Friends</h3>
        <p style={{ fontSize:13,color:C.textMuted,marginBottom:12 }}>Share your code to compete together:</p>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:C.blue,letterSpacing:'0.15em',background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 16px' }}>
            {shareCode}
          </div>
          <button onClick={()=>navigator.clipboard?.writeText(shareCode)} style={{ padding:'9px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontSize:13,fontFamily:"'Space Grotesk',sans-serif" }}>
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
