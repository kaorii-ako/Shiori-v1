import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, X, Brain, Coffee, SkipForward, Music, Volume2, VolumeX } from 'lucide-react'
import { usePomodoroStore, useAssignmentsStore, useXPStore } from '../stores'
import { playDing } from '../utils/sounds'

const fmt = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const AMBIENT = [
  { label: 'Rain', emoji: '🌧️', freq: [200, 600], type: 'noise' },
  { label: 'Forest', emoji: '🌲', freq: [300, 800], type: 'noise' },
  { label: 'White noise', emoji: '📻', freq: [100, 8000], type: 'white' },
  { label: 'Lo-fi beat', emoji: '🎵', freq: [220, 440], type: 'lofi' },
]

export default function FocusMode() {
  const navigate = useNavigate()
  const {
    isRunning, isBreak, secondsLeft, workSeconds, breakSeconds,
    sessionCount, totalFocusMinutes, activeAssignment,
    start, pause, reset, tick, close,
  } = usePomodoroStore()
  const { assignments } = useAssignmentsStore()
  const { addXP } = useXPStore()

  const [muted, setMuted] = useState(false)
  const intervalRef = useRef(null)
  const prevBreak = useRef(isBreak)
  const [quote, setQuote] = useState(0)

  const QUOTES = [
    "The secret of getting ahead is getting started.",
    "Small progress is still progress.",
    "Focus on the process, not the outcome.",
    "Every expert was once a beginner.",
    "You don't have to be great to start, but you have to start to be great.",
    "Done is better than perfect.",
    "One step at a time.",
  ]

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    return () => { document.exitFullscreen?.().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, tick])

  useEffect(() => {
    if (prevBreak.current !== isBreak) {
      const wasWork = !prevBreak.current
      prevBreak.current = isBreak
      if (!muted) playDing(isBreak ? 'break' : 'focus')
      setQuote(q => (q + 1) % QUOTES.length)
      if (wasWork && isBreak) addXP(25, 'pomodoro_complete')
    }
  }, [isBreak, muted])

  const total = isBreak ? breakSeconds : workSeconds
  const progress = 1 - secondsLeft / total
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const accentColor = isBreak ? '#4dff91' : '#c44dff'

  const pending = assignments.filter(a => a.status !== 'completed' && a.status !== 'graded').slice(0, 5)

  const handleExit = () => {
    document.exitFullscreen?.().catch(() => {})
    navigate(-1)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: '#0a0d12',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}40, transparent 70%)`, filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: '10%', right: '15%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, #528dff40, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#afc6ff' }}>栞 FOCUS MODE</span>
          {sessionCount > 0 && (
            <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#606080' }}>Session #{sessionCount + 1}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setMuted(m => !m)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#8c90a0' }}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={handleExit} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#8c90a0', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Main timer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Mode badge */}
        <motion.div
          key={isBreak ? 'break' : 'focus'}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: `${accentColor}15`, border: `1px solid ${accentColor}40` }}
        >
          {isBreak ? <Coffee size={14} style={{ color: accentColor }} /> : <Brain size={14} style={{ color: accentColor }} />}
          <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: accentColor, letterSpacing: '0.05em' }}>
            {isBreak ? 'BREAK TIME' : 'DEEP FOCUS'}
          </span>
        </motion.div>

        {/* Ring */}
        <div style={{ position: 'relative', width: 280, height: 280 }}>
          <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r={RADIUS} fill="none" stroke="rgba(66,71,84,0.25)" strokeWidth="8" />
            <motion.circle
              cx="140" cy="140" r={RADIUS}
              fill="none" stroke={accentColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: isRunning ? `drop-shadow(0 0 12px ${accentColor})` : 'none', transition: 'stroke-dashoffset 0.9s linear, filter 0.5s' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <motion.span
              key={Math.floor(secondsLeft / 60)}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: '"Press Start 2P"', fontSize: 44, color: '#dfe2eb', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              {fmt(secondsLeft)}
            </motion.span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#606080' }}>
              {Math.round(progress * 100)}% complete
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={reset}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(66,71,84,0.2)', border: '1px solid rgba(66,71,84,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#606080' }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={isRunning ? pause : start}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isRunning
                ? 'linear-gradient(135deg, rgba(255,107,157,0.25), rgba(255,107,157,0.15))'
                : `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
              boxShadow: isRunning ? '0 0 32px rgba(255,107,157,0.25)' : `0 0 32px ${accentColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: isRunning ? '#ff6b9d' : accentColor,
            }}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
          </button>
          <button
            onClick={() => { if (!muted) playDing('break'); tick() }}
            title="Skip to next session"
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(66,71,84,0.2)', border: '1px solid rgba(66,71,84,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#606080' }}
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.p
            key={quote}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#606080', maxWidth: 360, textAlign: 'center', fontStyle: 'italic' }}
          >
            "{QUOTES[quote]}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Sidebar: assignments + stats */}
      <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', width: 200 }}>
        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#424754', marginBottom: 10, letterSpacing: '0.05em' }}>UP NEXT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pending.length > 0 ? pending.map((a, i) => (
            <div key={a.id} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(66,71,84,0.2)' }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: i === 0 ? '#dfe2eb' : '#8c90a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</p>
            </div>
          )) : (
            <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#424754' }}>All clear! 🎉</p>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#424754', marginBottom: 10 }}>TODAY</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Sessions', value: sessionCount, color: '#c44dff' },
              { label: 'Focus min', value: totalFocusMinutes, color: '#afc6ff' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#8c90a0' }}>{s.label}</span>
                <span style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
