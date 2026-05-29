import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Check, Trash2, Trophy, Calendar, Target } from 'lucide-react'
import GlassCard from '../components/GlassCard'

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

function getStreak(completions) {
  const today = new Date()
  let streak = 0
  let d = new Date(today)
  while (true) {
    const key = d.toISOString().split('T')[0]
    if (completions[key]) {
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
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [adding, setAdding] = useState(false)

  const save = (updated) => {
    setHabits(updated)
    localStorage.setItem('shiori-habits', JSON.stringify(updated))
  }

  const toggleDay = (habitId, dateKey) => {
    save(habits.map(h => {
      if (h.id !== habitId) return h
      const completions = { ...h.completions }
      if (completions[dateKey]) {
        delete completions[dateKey]
      } else {
        completions[dateKey] = true
      }
      return { ...h, completions }
    }))
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

  const totalStreak = habits.reduce((sum, h) => sum + getStreak(h.completions), 0)
  const completedToday = habits.filter(h => h.completions[todayKey]).length

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Flame style={{ color: '#ff6b9d' }} /> Habit Tracker
        </h1>
        <p className="text-text-secondary mt-1">Build streaks, stay consistent</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today', value: `${completedToday}/${habits.length}`, icon: Check, color: '#4dff91' },
          { label: 'Total Streaks', value: totalStreak, icon: Flame, color: '#ff6b9d' },
          { label: 'Habits', value: habits.length, icon: Target, color: '#afc6ff' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontFamily: '"Press Start 2P"', fontSize: 14, color: '#dfe2eb' }}>{value}</p>
                  <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#8c90a0' }}>{label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Day headers */}
      <GlassCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 6, alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(66,71,84,0.2)' }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#606080', letterSpacing: '0.06em' }}>HABIT</span>
          {last7.map((dateKey, i) => {
            const d = new Date(dateKey + 'T12:00:00')
            return (
              <div key={dateKey} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: '#606080' }}>{DAYS[d.getDay()]}</p>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: dateKey === todayKey ? '#afc6ff' : '#424754', fontWeight: dateKey === todayKey ? 700 : 400 }}>{d.getDate()}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {habits.map(habit => {
              const streak = getStreak(habit.completions)
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 6, alignItems: 'center', padding: '6px 0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#dfe2eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{habit.name}</span>
                    {streak > 0 && (
                      <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#ff6b9d', flexShrink: 0 }}>🔥{streak}</span>
                    )}
                    <button onClick={() => deleteHabit(habit.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#424754', padding: 2, flexShrink: 0, opacity: 0.5 }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {last7.map(dateKey => {
                    const done = !!habit.completions[dateKey]
                    const isToday = dateKey === todayKey
                    return (
                      <button
                        key={dateKey}
                        onClick={() => toggleDay(habit.id, dateKey)}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: done ? `${habit.color}25` : 'rgba(66,71,84,0.15)',
                          border: `1.5px solid ${done ? habit.color : isToday ? 'rgba(175,198,255,0.25)' : 'rgba(66,71,84,0.20)'}`,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: done ? `0 0 8px ${habit.color}40` : 'none',
                        }}
                      >
                        {done && <Check size={13} style={{ color: habit.color }} />}
                      </button>
                    )
                  })}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Add habit */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(66,71,84,0.2)' }}>
          <AnimatePresence>
            {adding ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addHabit(); if (e.key === 'Escape') setAdding(false) }}
                    placeholder="Habit name..."
                    style={{ flex: 1, minWidth: 160, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#dfe2eb', fontFamily: "'Manrope', sans-serif", fontSize: 13, outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setNewColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: newColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                  <button onClick={addHabit} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(196,77,255,0.2)', border: '1px solid rgba(196,77,255,0.35)', color: '#e5b5ff', fontFamily: '"Press Start 2P"', fontSize: 8, cursor: 'pointer' }}>ADD</button>
                  <button onClick={() => setAdding(false)} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(66,71,84,0.2)', border: 'none', color: '#606080', cursor: 'pointer', fontFamily: '"Press Start 2P"', fontSize: 8 }}>×</button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(175,198,255,0.08)', border: '1px dashed rgba(175,198,255,0.2)', color: '#8c90a0', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontSize: 13 }}
              >
                <Plus size={14} /> Add habit
              </button>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Trophy section */}
      {totalStreak >= 7 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Trophy size={24} style={{ color: '#ffd6a0' }} />
              <div>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#ffd6a0' }}>STREAK MASTER</p>
                <p style={{ fontFamily: 'VT323', fontSize: 15, color: '#8c90a0', marginTop: 2 }}>Combined streak of {totalStreak} days. Keep going!</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
