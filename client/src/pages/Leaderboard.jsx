import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Flame, Star, Share2, Crown, Medal,
  Users, Plus, X, CheckCircle2, Sparkles,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { useAuthStore, useAssignmentsStore, useGradesStore } from '../stores'

const LB_KEY = 'shiori-leaderboard'

function loadBoard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]') }
  catch { return [] }
}
function saveBoard(b) { localStorage.setItem(LB_KEY, JSON.stringify(b)) }

function buildMyCard(user, assignments, courseGrades, courses) {
  const completed = assignments.filter(a => a.status === 'completed' || a.status === 'graded').length
  const total = assignments.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  let totalPts = 0, totalPoss = 0
  Object.values(courseGrades || {}).forEach(cg => {
    Object.values(cg).forEach(g => { totalPts += g.pointsEarned || 0; totalPoss += g.pointsPossible || 0 })
  })
  const gpa = totalPoss > 0 ? ((totalPts / totalPoss) * 100).toFixed(1) : null

  const streak = user?.streak || 0
  const score = streak * 10 + completionRate + (gpa ? Math.round(parseFloat(gpa) / 2) : 0)

  return {
    id: 'me',
    name: user?.name || 'You',
    avatar: (user?.name || 'Y')[0].toUpperCase(),
    streak,
    completionRate,
    gpa,
    score,
    isMe: true,
    updatedAt: Date.now(),
  }
}

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown size={18} style={{ color: '#ffd700' }} />
  if (rank === 2) return <Medal size={18} style={{ color: '#c0c0c0' }} />
  if (rank === 3) return <Medal size={18} style={{ color: '#cd7f32' }} />
  return (
    <span style={{
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 10, color: '#606080', minWidth: 18, textAlign: 'center',
    }}>{rank}</span>
  )
}

export default function Leaderboard() {
  const { user } = useAuthStore()
  const { assignments } = useAssignmentsStore()
  const { courseGrades } = useGradesStore()
  const { courses } = useAssignmentsStore()

  const [board, setBoard] = useState(loadBoard)
  const [addOpen, setAddOpen] = useState(false)
  const [addCode, setAddCode] = useState('')
  const [addError, setAddError] = useState('')
  const [copied, setCopied] = useState(false)

  const myCard = buildMyCard(user, assignments, courseGrades, courses)

  const allEntries = [...board.filter(e => e.id !== 'me'), myCard]
    .sort((a, b) => b.score - a.score)

  const myRank = allEntries.findIndex(e => e.isMe) + 1
  const prevTop = board.find(e => e.id !== 'me' && !e.isMe)

  const myShareCode = btoa(JSON.stringify({
    id: user?.id || user?.email || 'anon',
    name: myCard.name,
    avatar: myCard.avatar,
    streak: myCard.streak,
    completionRate: myCard.completionRate,
    gpa: myCard.gpa,
    score: myCard.score,
  }))

  const copyCode = () => {
    navigator.clipboard.writeText(myShareCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareToTwitter = () => {
    const rank = myRank
    const text = `📊 My Shiori study stats:\n🔥 ${myCard.streak}-day streak\n✅ ${myCard.completionRate}% assignments done${myCard.gpa ? `\n📈 ${myCard.gpa}% GPA` : ''}\n\nI'm #${rank} on my leaderboard!\n\nFree AI study companion → https://shiori-v1.vercel.app\n#Shiori #StudyWithAI`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const addFriend = () => {
    setAddError('')
    try {
      const data = JSON.parse(atob(addCode.trim()))
      if (!data.name || typeof data.score !== 'number') throw new Error('invalid')
      const entry = { ...data, id: data.id || data.name, isMe: false, addedAt: Date.now() }
      const updated = [...board.filter(e => e.id !== entry.id && e.id !== 'me'), entry]
      setBoard(updated)
      saveBoard(updated)
      setAddCode('')
      setAddOpen(false)
      if (entry.score > myCard.score) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 }, colors: ['#c44dff', '#afc6ff'] })
      }
    } catch {
      setAddError('Invalid code. Ask your friend to copy their code again.')
    }
  }

  const remove = (id) => {
    const updated = board.filter(e => e.id !== id)
    setBoard(updated)
    saveBoard(updated)
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 18, color: '#dfe2eb', marginBottom: 6,
        }}>LEADERBOARD</div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0' }}>
          Compare study streaks and completion rates with friends. Share your code to add each other.
        </p>
      </div>

      {/* My stats card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(196,77,255,0.08) 0%, rgba(82,141,255,0.06) 100%)',
          border: '1px solid rgba(196,77,255,0.30)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, fontWeight: 700, color: '#e5b5ff',
              letterSpacing: '0.06em',
            }}>YOUR STATS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={copyCode}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  background: copied ? 'rgba(77,255,145,0.15)' : 'rgba(196,77,255,0.12)',
                  border: `1px solid ${copied ? 'rgba(77,255,145,0.4)' : 'rgba(196,77,255,0.35)'}`,
                  color: copied ? '#4dff91' : '#e5b5ff',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                }}
              >
                {copied ? <><CheckCircle2 size={12} /> Copied!</> : <><Share2 size={12} /> Copy My Code</>}
              </button>
              <button
                onClick={shareToTwitter}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  background: 'rgba(29,161,242,0.10)',
                  border: '1px solid rgba(29,161,242,0.25)',
                  color: '#1da1f2', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
                }}
              >
                <Share2 size={12} /> Share on X
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'STREAK', value: `${myCard.streak}d`, icon: Flame, color: '#ff6b9d' },
              { label: 'COMPLETION', value: `${myCard.completionRate}%`, icon: CheckCircle2, color: '#4dff91' },
              { label: 'GPA', value: myCard.gpa ? `${myCard.gpa}%` : '—', icon: Star, color: '#afc6ff' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                padding: '12px 10px', borderRadius: 8, textAlign: 'center',
                background: 'rgba(24,28,34,0.5)',
                border: '1px solid rgba(66,71,84,0.25)',
              }}>
                <Icon size={16} style={{ color, marginBottom: 6 }} />
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color }}>{value}</div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: '#606080', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 14,
            fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080',
            textAlign: 'center',
          }}>
            Score: <strong style={{ color: '#e5b5ff' }}>{myCard.score}</strong> pts
            {myRank === 1 && allEntries.length > 1 ? ' · 👑 You\'re #1!' : myRank > 1 ? ` · Rank #${myRank}` : ''}
          </div>
        </GlassCard>
      </motion.div>

      {/* Leaderboard table */}
      <GlassCard style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12, fontWeight: 700, color: '#8c90a0',
            letterSpacing: '0.06em',
          }}>
            <Users size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {allEntries.length} STUDENT{allEntries.length !== 1 ? 'S' : ''}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: 'rgba(82,141,255,0.12)',
              border: '1px solid rgba(82,141,255,0.30)',
              color: '#afc6ff', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
            }}
          >
            <Plus size={12} /> Add Friend
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allEntries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: entry.isMe
                  ? 'rgba(196,77,255,0.10)'
                  : 'rgba(24,28,34,0.5)',
                border: `1px solid ${entry.isMe ? 'rgba(196,77,255,0.35)' : 'rgba(66,71,84,0.25)'}`,
                position: 'relative',
              }}
            >
              <div style={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <RankBadge rank={i + 1} />
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: entry.isMe
                  ? 'linear-gradient(135deg, rgba(196,77,255,0.3), rgba(82,141,255,0.2))'
                  : 'rgba(66,71,84,0.4)',
                border: `2px solid ${entry.isMe ? 'rgba(196,77,255,0.5)' : 'rgba(66,71,84,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14,
                color: entry.isMe ? '#e5b5ff' : '#8c90a0',
              }}>
                {entry.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, fontSize: 14, color: '#dfe2eb',
                  }}>
                    {entry.name}
                  </span>
                  {entry.isMe && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 4,
                      background: 'rgba(196,77,255,0.2)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 9, fontWeight: 700, color: '#e5b5ff',
                    }}>YOU</span>
                  )}
                </div>
                <div style={{
                  display: 'flex', gap: 12, marginTop: 3,
                  fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#606080',
                }}>
                  <span>🔥 {entry.streak}d</span>
                  <span>✅ {entry.completionRate}%</span>
                  {entry.gpa && <span>📈 {entry.gpa}%</span>}
                </div>
              </div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 12,
                color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#606080',
              }}>
                {entry.score}
              </div>
              {!entry.isMe && (
                <button
                  onClick={() => remove(entry.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#606080', padding: 2, marginLeft: 4,
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {allEntries.length === 1 && (
          <div style={{
            marginTop: 16, textAlign: 'center',
            fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#606080',
          }}>
            Add friends to compete! Share your code → they paste it to add you.
          </div>
        )}
      </GlassCard>

      {/* Add friend modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
            onClick={e => { if (e.target === e.currentTarget) setAddOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              style={{
                width: '100%', maxWidth: 420, padding: 24, borderRadius: 16,
                background: '#181c24', border: '1px solid rgba(66,71,84,0.5)',
              }}
            >
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 14, color: '#dfe2eb', marginBottom: 8,
              }}>ADD FRIEND</div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', marginBottom: 16 }}>
                Ask your friend to go to their Leaderboard page and copy their code. Paste it below.
              </p>
              <textarea
                rows={4}
                placeholder="Paste friend's code here..."
                value={addCode}
                onChange={e => { setAddCode(e.target.value); setAddError('') }}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(24,28,34,0.8)',
                  border: `1px solid ${addError ? 'rgba(255,107,157,0.5)' : 'rgba(66,71,84,0.40)'}`,
                  color: '#dfe2eb', outline: 'none', resize: 'none',
                  fontFamily: "'Manrope', sans-serif", fontSize: 12,
                }}
              />
              {addError && (
                <p style={{ color: '#ff6b9d', fontFamily: "'Manrope', sans-serif", fontSize: 12, marginTop: 6 }}>
                  {addError}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Button onClick={addFriend} style={{ flex: 1 }}>
                  <Plus size={14} /> Add to Leaderboard
                </Button>
                <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
