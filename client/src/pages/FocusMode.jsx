import { useState, useEffect, useRef } from 'react'
import { Target, Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react'
import { C, fonts, tint } from '../utils/theme'

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

  const circumference = 2 * Math.PI * 96
  const dash = circumference * (1 - pct / 100)
  const phaseColor = isBreak ? C.green : C.blue
  const phaseColorDark = isBreak ? C.greenDark : C.blueDark

  return (
    <div style={{
      fontFamily: fonts.body, color: C.text,
      minHeight: 'calc(100vh - 150px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>

      <h1 style={{
        display: 'flex', alignItems: 'center', gap: 9,
        fontFamily: fonts.heading, fontSize: 18, fontWeight: 700,
        color: C.textMuted, marginBottom: 32, letterSpacing: '0.14em',
      }}>
        <Target size={18} color={phaseColor} /> FOCUS MODE
      </h1>

      {/* Phase label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 18px', borderRadius: 999, marginBottom: 26,
        background: tint(phaseColorDark, 0.1),
        border: `1px solid ${tint(phaseColorDark, 0.45)}`,
        fontFamily: fonts.heading, fontSize: 12, fontWeight: 700,
        color: phaseColor, letterSpacing: '0.1em',
      }}>
        {isBreak ? <><Coffee size={13} /> BREAK TIME</> : <><Zap size={13} /> FOCUS SESSION</>}
      </div>

      {/* Circular timer */}
      <div style={{ position: 'relative', width: 230, height: 230, marginBottom: 32 }}>
        <svg width="230" height="230" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="115" cy="115" r="96" fill="none" stroke={C.border} strokeWidth="7" />
          <circle
            cx="115" cy="115" r="96" fill="none"
            stroke={phaseColorDark}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 50, fontWeight: 700, color: C.text, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {mins}:{secs}
          </div>
          <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>{pct}% elapsed</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button onClick={() => setRunning(r => !r)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 34px', borderRadius: 12, border: 'none',
          background: running ? tint(C.pink, 0.15) : C.blueDark,
          color: running ? C.pink : '#0b0e14',
          cursor: 'pointer', fontFamily: fonts.heading, fontSize: 15, fontWeight: 700,
          minWidth: 130,
          transition: 'all 0.2s ease',
        }}>
          {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
        </button>
        <button onClick={reset} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '13px 22px', borderRadius: 12,
          border: `1px solid ${C.border}`, background: 'transparent',
          color: C.textMuted, cursor: 'pointer',
          fontFamily: fonts.heading, fontSize: 14, fontWeight: 600,
        }}><RotateCcw size={14} /> Reset</button>
      </div>

      {/* Preset selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(i)} style={{
            padding: '7px 18px', borderRadius: 999,
            border: `1px solid ${preset === i ? tint(C.blue, 0.45) : C.border}`,
            background: preset === i ? tint(C.blue, 0.1) : 'transparent',
            color: preset === i ? C.blue : C.textMuted,
            cursor: 'pointer', fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
            transition: 'all 0.15s ease',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Current task */}
      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="What are you working on?"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: C.card, border: `1px solid ${C.border}`,
            color: C.text, fontSize: 14, fontFamily: fonts.body,
            textAlign: 'center', boxSizing: 'border-box', outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={e => { e.target.style.borderColor = C.blueDark }}
          onBlur={e => { e.target.style.borderColor = C.border }}
        />
      </div>
    </div>
  )
}
