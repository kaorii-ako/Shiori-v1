import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, X, Coffee, Brain, ChevronUp, ChevronDown } from 'lucide-react'
import { usePomodoroStore, useAssignmentsStore } from '../stores'

const fmt = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const PomodoroTimer = () => {
  const {
    isRunning, isBreak, secondsLeft, workSeconds, breakSeconds,
    sessionCount, totalFocusMinutes, activeAssignment,
    start, pause, reset, tick, close, setActiveAssignment,
  } = usePomodoroStore()

  const { assignments } = useAssignmentsStore()
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, tick])

  const total = isBreak ? breakSeconds : workSeconds
  const progress = 1 - secondsLeft / total
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const pending = assignments.filter(a => a.status !== 'graded')
  const accentColor = isBreak ? '#4dff91' : '#c44dff'
  const accentBg = isBreak ? 'rgba(74,215,120,0.12)' : 'rgba(196,77,255,0.12)'

  if (!visible) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20, zIndex: 90,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(196,77,255,0.15)',
          border: '1px solid rgba(196,77,255,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          boxShadow: isRunning ? '0 0 16px rgba(196,77,255,0.4)' : 'none',
        }}
        title="Open Pomodoro Timer"
      >
        {isRunning
          ? <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#e5b5ff' }}>{fmt(secondsLeft)}</span>
          : <Brain size={18} style={{ color: '#c44dff' }} />
        }
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      style={{
        position: 'fixed', bottom: 88, right: 20, zIndex: 90,
        width: expanded ? 280 : 200,
        borderRadius: 16,
        background: 'rgba(16,20,26,0.92)',
        border: `1px solid ${isRunning ? 'rgba(196,77,255,0.40)' : 'rgba(66,71,84,0.35)'}`,
        backdropFilter: 'blur(20px)',
        boxShadow: isRunning ? '0 0 32px rgba(196,77,255,0.18), 0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        transition: 'width 0.25s ease, border-color 0.3s',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(66,71,84,0.20)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isBreak
            ? <Coffee size={13} style={{ color: '#4dff91' }} />
            : <Brain size={13} style={{ color: '#c44dff' }} />
          }
          <span style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: isBreak ? '#4dff91' : '#e5b5ff', letterSpacing: '0.04em' }}>
            {isBreak ? 'BREAK' : 'FOCUS'}
          </span>
          {sessionCount > 0 && (
            <span style={{
              marginLeft: 4, padding: '1px 6px', borderRadius: 100,
              background: 'rgba(196,77,255,0.15)',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#c44dff',
            }}>
              ×{sessionCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#424754', padding: 4 }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
          <button
            onClick={() => { close(); setVisible(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#424754', padding: 4 }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Timer ring + time */}
      <div style={{ padding: '16px 14px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flexShrink: 0, position: 'relative', width: 88, height: 88 }}>
          <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="rgba(66,71,84,0.30)" strokeWidth="5" />
            <motion.circle
              cx="44" cy="44" r={RADIUS}
              fill="none"
              stroke={accentColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: isRunning ? `drop-shadow(0 0 6px ${accentColor})` : 'none', transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: '"Press Start 2P"', fontSize: 14, color: '#dfe2eb', lineHeight: 1 }}>
              {fmt(secondsLeft)}
            </span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: '#606080', marginTop: 3 }}>
              {Math.round((1 - secondsLeft / total) * 100)}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeAssignment && (
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#8c90a0',
              marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {activeAssignment.title}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={isRunning ? pause : start}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8,
                background: isRunning ? 'rgba(255,107,157,0.15)' : `rgba(196,77,255,0.20)`,
                border: `1px solid ${isRunning ? 'rgba(255,107,157,0.3)' : 'rgba(196,77,255,0.35)'}`,
                color: isRunning ? '#ff6b9d' : '#e5b5ff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              {isRunning ? <Pause size={13} /> : <Play size={13} />}
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 7 }}>
                {isRunning ? 'PAUSE' : 'START'}
              </span>
            </button>
            <button
              onClick={reset}
              style={{
                padding: '7px 9px', borderRadius: 8,
                background: 'rgba(66,71,84,0.20)',
                border: '1px solid rgba(66,71,84,0.30)',
                color: '#606080', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <RotateCcw size={12} />
            </button>
          </div>
          {totalFocusMinutes > 0 && (
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: '#424754', marginTop: 6 }}>
              {totalFocusMinutes} min focused today
            </p>
          )}
        </div>
      </div>

      {/* Assignment picker (expanded) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(66,71,84,0.20)',
              padding: '10px 14px 14px',
            }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#606080', marginBottom: 8, letterSpacing: '0.06em' }}>
                STUDYING:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                {pending.length > 0 ? pending.slice(0, 6).map(a => (
                  <button
                    key={a.id}
                    onClick={() => setActiveAssignment(a)}
                    style={{
                      padding: '7px 10px', borderRadius: 6, textAlign: 'left',
                      background: activeAssignment?.id === a.id ? 'rgba(196,77,255,0.15)' : 'rgba(24,28,34,0.6)',
                      border: `1px solid ${activeAssignment?.id === a.id ? 'rgba(196,77,255,0.30)' : 'rgba(66,71,84,0.20)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: activeAssignment?.id === a.id ? '#e5b5ff' : '#8c90a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.title}
                    </p>
                  </button>
                )) : (
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#424754' }}>
                    No pending assignments
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PomodoroTimer
