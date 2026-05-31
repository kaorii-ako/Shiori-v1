import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Flame, Star, Share2, Crown, Medal,
  Users, Plus, X, CheckCircle2, Sparkles,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuthStore, useAssignmentsStore, useGradesStore } from '../stores'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  border: 'rgba(50,55,70,0.4)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
}

const card = {
  background: 'rgba(13,17,24,0.95)',
  border: '1px solid rgba(50,55,70,0.4)',
  borderRadius: 12,
  padding: '20px 24px',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: T.text, outline: 'none',
  fontFamily: "'Manrope', sans-serif", fontSize: 14,
  boxSizing: 'border-box',
}

const primaryBtn = {
  padding: '9px 20px', borderRadius: 8,
  background: 'linear-gradient(135deg, #c44dff, #528dff)',
  color: '#fff', border: 'none',
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
  fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
}

const secondaryBtn = {
  padding: '8px 16px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: T.text,
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
  fontSize: 13, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 7,
}

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

const PODIUM_COLORS = {
  1: { bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.35)', text: '#ffd700', icon: Crown },
  2: { bg: 'rgba(192,192,192,0.10)', border: 'rgba(192,192,192,0.3)', text: '#c0c0c0', icon: Medal },
  3: { bg: 'rgba(205,127,50,0.10)', border: 'rgba(205,127,50,0.3)', text: '#cd7f32', icon: Medal },
}

const PodiumCard = ({ entry, rank, height }) => {
  const p = PODIUM_COLORS[rank]
  const Icon = p.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.4 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: 1,
      }}
    >
      {/* Avatar + name above platform */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={16} style={{ color: p.text }} />
        <div style={{
          width: rank === 1 ? 56 : 46, height: rank === 1 ? 56 : 46,
          borderRadius: '50%',
          background: entry?.isMe
            ? 'linear-gradient(135deg, rgba(196,77,255,0.3), rgba(82,141,255,0.2))'
            : p.bg,
          border: `2px solid ${entry?.isMe ? 'rgba(196,77,255,0.5)' : p.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
          fontSize: rank === 1 ? 22 : 18,
          color: entry?.isMe ? T.purple : p.text,
        }}>
          {entry ? entry.avatar : '?'}
        </div>
        {entry && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 13, color: T.text,
              maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{entry.name}</div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 14, color: p.text, marginTop: 2,
            }}>{entry.score}</div>
          </div>
        )}
      </div>
      {/* Platform */}
      <div style={{
        width: '100%', height,
        background: p.bg, border: `1px solid ${p.border}`,
        borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        fontSize: 20, color: p.text,
      }}>
        {rank}
      </div>
    </motion.div>
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
    const text = `📊 My Shiori study stats:\n🔥 ${myCard.streak}-day streak\n✅ ${myCard.completionRate}% assignments done${myCard.gpa ? `\n📈 ${myCard.gpa}% GPA` : ''}\n\nI'm #${rank} on my leaderboard!\n\nFree AI study companion → https://shiorii.tech\n#Shiori #StudyWithAI`
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

  const top3 = [allEntries[1], allEntries[0], allEntries[2]] // 2nd, 1st, 3rd for podium layout
  const rest = allEntries.slice(3)

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,107,157,0.15))',
            border: '1px solid rgba(255,215,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={18} style={{ color: '#ffd700' }} />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 22, color: T.text, margin: 0,
          }}>Leaderboard</h1>
          {myRank > 0 && (
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: 'rgba(196,77,255,0.15)',
              border: '1px solid rgba(196,77,255,0.3)',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              fontSize: 12, color: T.purple,
            }}>#{myRank}</span>
          )}
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, margin: 0 }}>
          Compare study streaks and completion rates with friends.
        </p>
      </motion.div>

      {/* Share code section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          ...card,
          background: 'linear-gradient(135deg, rgba(196,77,255,0.07), rgba(82,141,255,0.05))',
          border: '1px solid rgba(196,77,255,0.25)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              fontSize: 11, color: T.purple, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>Your Share Code</div>
            <div style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted,
            }}>
              Send to friends so they can add you to their leaderboard.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={copyCode}
              style={{
                ...secondaryBtn,
                background: copied ? 'rgba(77,255,145,0.12)' : 'rgba(196,77,255,0.10)',
                border: `1px solid ${copied ? 'rgba(77,255,145,0.35)' : 'rgba(196,77,255,0.3)'}`,
                color: copied ? T.green : T.purple,
              }}
            >
              {copied ? <><CheckCircle2 size={13} /> Copied!</> : <><Share2 size={13} /> Copy Code</>}
            </button>
            <button onClick={shareToTwitter} style={{
              ...secondaryBtn,
              background: 'rgba(29,161,242,0.08)',
              border: '1px solid rgba(29,161,242,0.22)',
              color: '#1da1f2',
            }}>
              <Share2 size={13} /> Share on X
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'STREAK', value: `${myCard.streak}d`, color: T.pink },
            { label: 'COMPLETION', value: `${myCard.completionRate}%`, color: T.green },
            { label: 'GPA', value: myCard.gpa ? `${myCard.gpa}%` : '—', color: T.blue },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '10px 8px', borderRadius: 8, textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: 18, color, marginBottom: 2,
              }}>{value}</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                fontSize: 10, color: T.faint, letterSpacing: '0.08em',
              }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Podium — top 3 */}
      {allEntries.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: 20 }}
        >
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
            fontSize: 11, color: T.muted, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 14,
          }}>Top Rankings</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
            <PodiumCard entry={allEntries[1] || null} rank={2} height={90} />
            <PodiumCard entry={allEntries[0] || null} rank={1} height={130} />
            <PodiumCard entry={allEntries[2] || null} rank={3} height={70} />
          </div>
        </motion.div>
      )}

      {/* Ranked list — 4th onwards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ ...card, marginBottom: 14 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
            fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Users size={13} />
            {allEntries.length} Student{allEntries.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              padding: '6px 12px', borderRadius: 7,
              background: 'rgba(82,141,255,0.10)',
              border: '1px solid rgba(82,141,255,0.28)',
              color: T.blue, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <Plus size={12} /> Add Friend
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allEntries.map((entry, i) => {
            const rankColor = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : T.faint
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: entry.isMe
                    ? 'rgba(196,77,255,0.09)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${entry.isMe ? 'rgba(196,77,255,0.3)' : T.border}`,
                }}
              >
                {/* Rank */}
                <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                  {i === 0 ? <Crown size={16} style={{ color: '#ffd700' }} /> :
                   i === 1 ? <Medal size={16} style={{ color: '#c0c0c0' }} /> :
                   i === 2 ? <Medal size={16} style={{ color: '#cd7f32' }} /> : (
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                      fontSize: 13, color: T.faint,
                    }}>{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: entry.isMe
                    ? 'linear-gradient(135deg, rgba(196,77,255,0.3), rgba(82,141,255,0.2))'
                    : 'rgba(50,55,70,0.4)',
                  border: `2px solid ${entry.isMe ? 'rgba(196,77,255,0.45)' : 'rgba(50,55,70,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                  fontSize: 15, color: entry.isMe ? T.purple : T.muted,
                }}>
                  {entry.avatar}
                </div>

                {/* Name + stats */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600, fontSize: 14, color: T.text,
                    }}>{entry.name}</span>
                    {entry.isMe && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 4,
                        background: 'rgba(196,77,255,0.2)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 9, fontWeight: 700, color: T.purple,
                        letterSpacing: '0.06em',
                      }}>YOU</span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex', gap: 10, marginTop: 3,
                    fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted,
                  }}>
                    <span>🔥 {entry.streak}d</span>
                    <span>✅ {entry.completionRate}%</span>
                    {entry.gpa && <span>📈 {entry.gpa}%</span>}
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                  fontSize: 15, color: rankColor,
                }}>
                  {entry.score}
                </div>

                {!entry.isMe && (
                  <button
                    onClick={() => remove(entry.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.faint, padding: 2, marginLeft: 2,
                      display: 'flex', alignItems: 'center',
                    }}
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>

        {allEntries.length === 1 && (
          <div style={{
            marginTop: 16, padding: '16px', borderRadius: 9, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: `1px dashed ${T.border}`,
            fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint,
          }}>
            Add friends to compete! Share your code → they paste it to add you.
          </div>
        )}
      </motion.div>

      {/* Add friend input strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ ...card, marginBottom: 0 }}
      >
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
          fontSize: 11, color: T.muted, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 10,
        }}>Add a Friend</div>
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, marginBottom: 12,
        }}>
          Ask your friend to copy their share code, then paste it below.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Paste friend's code here..."
            value={addCode}
            onChange={e => { setAddCode(e.target.value); setAddError('') }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addFriend}
            disabled={!addCode.trim()}
            style={{ ...primaryBtn, opacity: !addCode.trim() ? 0.45 : 1, flexShrink: 0 }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {addError && (
          <p style={{
            color: T.pink, fontFamily: "'Manrope', sans-serif",
            fontSize: 12, marginTop: 8,
          }}>{addError}</p>
        )}
      </motion.div>

      {/* Add friend modal (keep for larger input) */}
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
                width: '100%', maxWidth: 420, padding: 28, borderRadius: 16,
                background: 'rgba(13,17,24,0.98)', border: '1px solid rgba(50,55,70,0.5)',
              }}
            >
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: 18, color: T.text, marginBottom: 8,
              }}>Add Friend</div>
              <p style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 13,
                color: T.muted, marginBottom: 16, lineHeight: 1.6,
              }}>
                Ask your friend to go to their Leaderboard page and copy their code. Paste it below.
              </p>
              <textarea
                rows={4}
                placeholder="Paste friend's code here..."
                value={addCode}
                onChange={e => { setAddCode(e.target.value); setAddError('') }}
                style={{
                  ...inputStyle, resize: 'none',
                  border: `1px solid ${addError ? 'rgba(255,107,157,0.5)' : 'rgba(50,55,70,0.4)'}`,
                }}
              />
              {addError && (
                <p style={{ color: T.pink, fontFamily: "'Manrope', sans-serif", fontSize: 12, marginTop: 6 }}>
                  {addError}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={addFriend} style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>
                  <Plus size={14} /> Add to Leaderboard
                </button>
                <button onClick={() => setAddOpen(false)} style={secondaryBtn}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
