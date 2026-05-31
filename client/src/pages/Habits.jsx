import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Check, Trash2, Trophy, Calendar, Target, Snowflake } from 'lucide-react'
import confetti from 'canvas-confetti'
import GlassCard from '../components/GlassCard'

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
  cyan: '#4daaff',
}

const card = {
  background: 'rgba(13,17,24,0.95)',
  border: '1px solid rgba(50,55,70,0.4)',
  borderRadius: 12,
  padding: '20px 24px',
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const COLORS = ['#c44dff', '#528dff', '#4dff91', '#ff6b9d', '#ffd6a0', '#afc6ff', '#e5b5ff']

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getWeekKey() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  return `${d.getFullYear()}-W${Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)}`
}

function getStreak(completions, freezes = {}) {
  const today = new Date()
  let streak = 0
  let d = new Date(today)
  while (true) {
    const key = d.toISOString().split('T')[0]
    if (completions[key] || freezes[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

const defaultHabits = [
  { id: '1', name: 'Read 20 pages', color: '#afc6ff', completions: {} },
  { id: '2', name: 'Review flashcards', color: '#c44dff', completions: {} },
  { id: '3', name: 'Exercise 30 min', color: '#4dff91', completions: {} },
]

export default function Habits() {
  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shiori-habits') || 'null') || defaultHabits
    } catch { return defaultHabits }
  })
  const [freezeTokens, setFreezeTokens] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shiori-freeze-tokens') || 'null')
      if (stored?.week === getWeekKey()) return stored.count
      return 1
    } catch { return 1 }
  })
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [adding, setAdding] = useState(false)

  const saveFreeze = (count) => {
    setFreezeTokens(count)
    localStorage.setItem('shiori-freeze-tokens', JSON.stringify({ week: getWeekKey(), count }))
  }

  const applyFreeze = (habitId) => {
    if (freezeTokens < 1) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const key = yesterday.toISOString().split('T')[0]
    const updated = habits.map(h => {
      if (h.id !== habitId) return h
      const freezes = { ...(h.freezes || {}), [key]: true }
      return { ...h, freezes }
    })
    save(updated)
    saveFreeze(freezeTokens - 1)
  }

  const save = (updated) => {
    setHabits(updated)
    localStorage.setItem('shiori-habits', JSON.stringify(updated))
  }

  const confettiFiredRef = useRef(false)
  const [showShareCard, setShowShareCard] = useState(false)

  const toggleDay = (habitId, dateKey) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h
      const completions = { ...h.completions }
      if (completions[dateKey]) { delete completions[dateKey] }
      else { completions[dateKey] = true }
      return { ...h, completions }
    })
    save(updated)

    if (dateKey === new Date().toISOString().split('T')[0]) {
      const allDone = updated.length > 0 && updated.every(h => h.completions[dateKey])
      if (allDone && !confettiFiredRef.current) {
        confettiFiredRef.current = true
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: ['#c44dff', '#528dff', '#4dff91', '#ff6b9d', '#ffd6a0'] })
        setShowShareCard(true)
        setTimeout(() => { confettiFiredRef.current = false }, 3000)
      }
    }
  }

  const addHabit = () => {
    if (!newName.trim()) return
    const habit = { id: Date.now().toString(), name: newName.trim(), color: newColor, completions: {} }
    save([...habits, habit])
    setNewName('')
    setAdding(false)
  }

  const deleteHabit = (id) => save(habits.filter(h => h.id !== id))

  const last7 = getLast7Days()
  const todayKey = new Date().toISOString().split('T')[0]

  const totalStreak = habits.reduce((sum, h) => sum + getStreak(h.completions, h.freezes), 0)
  const completedToday = habits.filter(h => h.completions[todayKey]).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: T.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flame size={24} style={{ color: T.pink }} />
            Habits
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 4 }}>
            Build streaks, stay consistent
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} /> New Habit
        </button>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Today', value: `${completedToday}/${habits.length}`, icon: Check, color: T.green },
          { label: 'Total Streaks', value: totalStreak, icon: Flame, color: T.pink },
          { label: 'Habits', value: habits.length, icon: Target, color: T.blue },
        ].map(({ label, value, icon: Icon, color }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color, lineHeight: 1 }}>
                    {value}
                  </p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 3 }}>
                    {label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Habits list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <div style={card}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px) 60px', gap: 6, alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.faint, textTransform: 'uppercase' }}>
              Habit
            </span>
            {last7.map((dateKey) => {
              const d = new Date(dateKey + 'T12:00:00')
              return (
                <div key={dateKey} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 9, color: T.faint, textTransform: 'uppercase' }}>
                    {DAYS[d.getDay()]}
                  </p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: dateKey === todayKey ? T.blue : T.faint, fontWeight: dateKey === todayKey ? 700 : 400, marginTop: 1 }}>
                    {d.getDate()}
                  </p>
                </div>
              )
            })}
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.faint, textTransform: 'uppercase', textAlign: 'center' }}>
              Streak
            </span>
          </div>

          {/* Habit rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AnimatePresence>
              {habits.map((habit, idx) => {
                const streak = getStreak(habit.completions, habit.freezes)
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayKey = yesterday.toISOString().split('T')[0]
                const canFreeze = freezeTokens > 0 && streak > 0 && !habit.completions[todayKey] && !habit.completions[yesterdayKey] && !(habit.freezes || {})[yesterdayKey]
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px) 60px', gap: 6, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid rgba(50,55,70,0.2)` }}
                  >
                    {/* Habit name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {habit.name}
                      </span>
                      {canFreeze && (
                        <button
                          onClick={() => applyFreeze(habit.id)}
                          title={`Use freeze (${freezeTokens} left this week)`}
                          style={{ background: 'rgba(77,170,255,0.1)', border: '1px solid rgba(77,170,255,0.3)', borderRadius: 6, cursor: 'pointer', padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                        >
                          <Snowflake size={10} color={T.cyan} />
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: T.cyan }}>
                            {freezeTokens}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.faint, padding: 2, flexShrink: 0, opacity: 0.5, lineHeight: 1 }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* 7-day grid */}
                    {last7.map(dateKey => {
                      const done = !!habit.completions[dateKey]
                      const frozen = !!(habit.freezes || {})[dateKey]
                      const isToday = dateKey === todayKey
                      return (
                        <button
                          key={dateKey}
                          onClick={() => toggleDay(habit.id, dateKey)}
                          style={{
                            width: 32, height: 32, borderRadius: 7,
                            background: frozen ? 'rgba(77,170,255,0.1)' : done ? `${habit.color}25` : 'rgba(50,55,70,0.15)',
                            border: `1.5px solid ${frozen ? 'rgba(77,170,255,0.4)' : done ? habit.color : isToday ? 'rgba(175,198,255,0.3)' : 'rgba(50,55,70,0.25)'}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: done ? `0 0 8px ${habit.color}40` : 'none',
                          }}
                        >
                          {frozen
                            ? <Snowflake size={13} color={T.cyan} />
                            : done && <Check size={13} style={{ color: habit.color }} />
                          }
                        </button>
                      )
                    })}

                    {/* Streak */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {streak > 0 ? (
                        <>
                          <span style={{ fontSize: 14 }}>🔥</span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.pink }}>
                            {streak}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.faint }}>—</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Add habit form */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <AnimatePresence>
              {adding ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addHabit(); if (e.key === 'Escape') setAdding(false) }}
                      placeholder="Habit name..."
                      style={{ flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.text, outline: 'none', fontFamily: "'Manrope', sans-serif", fontSize: 14 }}
                    />
                    <div style={{ display: 'flex', gap: 5 }}>
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewColor(c)}
                          style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: newColor === c ? '2.5px solid #fff' : '2.5px solid transparent', cursor: 'pointer', transition: 'transform 0.1s', transform: newColor === c ? 'scale(1.15)' : 'scale(1)' }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={addHabit}
                      style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAdding(false)}
                      style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontSize: 13 }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(175,198,255,0.06)', border: '1px dashed rgba(175,198,255,0.25)', color: T.muted, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontSize: 13 }}
                >
                  <Plus size={14} /> Add habit
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Trophy section */}
      {totalStreak >= 7 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ ...card, background: `linear-gradient(135deg, ${T.orange}0d, ${T.purpleVibrant}08)`, border: `1px solid ${T.orange}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.orange}20`, border: `1px solid ${T.orange}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={22} style={{ color: T.orange }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: T.orange }}>
                  Streak Master
                </p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted, marginTop: 2 }}>
                  Combined streak of {totalStreak} days. Keep going!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Complete Today toast */}
      <AnimatePresence>
        {showShareCard && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              zIndex: 200, width: 'min(380px, 90vw)',
              background: 'rgba(16,20,26,0.97)',
              border: `1px solid ${T.green}50`,
              borderRadius: 14, padding: '18px 22px',
              boxShadow: `0 0 32px ${T.green}20, 0 16px 32px rgba(0,0,0,0.5)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.green, marginBottom: 3 }}>
                  All Habits Done!
                </p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
                  Share your streak with the world
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => {
                  const top = habits.reduce((best, h) => getStreak(h.completions, h.freezes) > getStreak(best.completions, best.freezes) ? h : best, habits[0])
                  const streak = getStreak(top?.completions || {}, top?.freezes || {})
                  const text = `🔥 ${streak}-day streak on "${top?.name || 'my habits'}"! Just completed all my daily habits with Shiori — free AI study companion → https://shiorii.tech #StudyWithAI`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                  setShowShareCard(false)
                }}
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, cursor: 'pointer', border: 'none', background: `${T.green}18`, color: T.green, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13 }}
              >
                Share on X 🐦
              </button>
              <button
                onClick={() => setShowShareCard(false)}
                style={{ padding: '9px 14px', borderRadius: 8, cursor: 'pointer', border: 'none', background: 'rgba(66,71,84,0.3)', color: T.muted, fontFamily: "'Manrope', sans-serif", fontSize: 13 }}
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
