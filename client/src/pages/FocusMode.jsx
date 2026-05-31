import { useState, useEffect, useRef } from 'react'
import { C } from '../utils/theme'

const PRESETS = [
  { label: '25 / 5', work: 25, brk: 5 },
  { label: '50 / 10', work: 50, brk: 10 },
  { label: '90 / 20', work: 90, brk: 20 },
]

export default function FocusMode() {
  const [preset, setPreset] = useState(0)
  const [seconds, setSeconds] = useState(PRESETS[0].work * 60)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [task, setTask] = useState('')
  const intervalRef = useRef(null)

  const total = isBreak ? PRESETS[preset].brk * 60 : PRESETS[preset].work * 60
  const pct = Math.round(((total - seconds) / total) * 100)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setIsBreak(b => !b)
            return isBreak ? PRESETS[preset].work * 60 : PRESETS[preset].brk * 60
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, isBreak, preset])

  const handlePreset = (i) => {
    setPreset(i)
    setRunning(false)
    setIsBreak(false)
    setSeconds(PRESETS[i].work * 60)
  }

  const reset = () => {
    setRunning(false)
    setIsBreak(false)
    setSeconds(PRESETS[preset].work * 60)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  const circumference = 2 * Math.PI * 90
  const dash = circumference * (1 - pct / 100)

  return (
    <div style={{
      fontFamily: "'Manrope', sans-serif", color: C.text,
      minHeight: 'calc(100vh - 96px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: C.bg,
    }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: C.textMuted, marginBottom: 32, letterSpacing: '0.1em' }}>
        🎯 FOCUS MODE
      </h1>

      {/* Phase label */}
      <div style={{
        padding: '4px 16px', borderRadius: 20, marginBottom: 24,
        background: isBreak ? 'rgba(77,255,145,0.12)' : 'rgba(175,198,255,0.12)',
        border: `1px solid ${isBreak ? C.greenDark : C.blueDark}`,
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700,
        color: isBreak ? C.green : C.blue, letterSpacing: '0.08em',
      }}>
        {isBreak ? '☕ BREAK TIME' : '⚡ FOCUS SESSION'}
      </div>

      {/* Circular timer */}
      <div style={{ position: 'relative', width: 220, height: 220, marginBottom: 32 }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r="90" fill="none" stroke={C.border} strokeWidth="8" />
          <circle
            cx="110" cy="110" r="90" fill="none"
            stroke={isBreak ? C.greenDark : C.blueDark}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 800, color: C.text, lineHeight: 1 }}>
            {mins}:{secs}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{pct}% elapsed</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button onClick={() => setRunning(r => !r)} style={{
          padding: '12px 32px', borderRadius: 10, border: 'none',
          background: running ? 'rgba(255,107,157,0.2)' : 'linear-gradient(135deg,#afc6ff,#528dff)',
          color: running ? C.pink : '#10141a',
          cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
          minWidth: 120,
        }}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={reset} style={{
          padding: '12px 20px', borderRadius: 10,
          border: `1px solid ${C.border}`, background: 'transparent',
          color: C.textMuted, cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
        }}>↺ Reset</button>
      </div>

      {/* Preset selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(i)} style={{
            padding: '7px 16px', borderRadius: 20,
            border: `1px solid ${preset === i ? C.blue : C.border}`,
            background: preset === i ? 'rgba(175,198,255,0.15)' : 'transparent',
            color: preset === i ? C.blue : C.textMuted,
            cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600,
          }}>{p.label}</button>
        ))}
      </div>

      {/* Current task */}
      <div style={{ width: '100%', maxWidth: 380 }}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="What are you working on?"
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 10,
            background: C.card, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 14, fontFamily: "'Manrope', sans-serif",
            textAlign: 'center', boxSizing: 'border-box', outline: 'none',
          }}
        />
      </div>
    </div>
  )
}
