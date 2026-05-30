import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useXPStore, getLevel, getNextLevel } from '../stores'
import confetti from 'canvas-confetti'

const LevelUpOverlay = ({ level, onClose }) => {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [level.color, '#afc6ff', '#e5b5ff'] })
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', cursor: 'pointer',
      }}
    >
      <motion.div
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        style={{
          textAlign: 'center', padding: '48px 64px',
          background: 'linear-gradient(135deg, #14181e, #1a1f2e)',
          border: `2px solid ${level.color}`,
          borderRadius: 20,
          boxShadow: `0 0 60px ${level.color}44`,
        }}
      >
        <div style={{ fontFamily: '"Press Start 2P"', fontSize: 11, color: '#8c90a0', marginBottom: 12 }}>
          LEVEL UP!
        </div>
        <div style={{ fontFamily: '"Press Start 2P"', fontSize: 32, color: level.color, marginBottom: 8 }}>
          {level.level}
        </div>
        <div style={{ fontFamily: 'VT323', fontSize: 28, color: '#dfe2eb' }}>
          {level.title}
        </div>
        <div style={{ fontFamily: 'VT323', fontSize: 16, color: '#606080', marginTop: 16 }}>
          click to continue
        </div>
      </motion.div>
    </motion.div>
  )
}

const XPBar = ({ collapsed }) => {
  const { xp, levelUpPending, clearLevelUp, getProgress } = useXPStore()
  const { pct, cur, next, xpInLevel, xpToNext } = getProgress()

  return (
    <>
      <AnimatePresence>
        {levelUpPending && (
          <LevelUpOverlay level={levelUpPending} onClose={clearLevelUp} />
        )}
      </AnimatePresence>

      <div style={{ padding: collapsed ? '8px 4px' : '8px 12px' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={11} color={cur.color} />
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: cur.color }}>
                LV{cur.level} {cur.title}
              </span>
            </div>
            <span style={{ fontFamily: '"Press Start 2P"', fontSize: 7, color: '#606080' }}>
              {xp} XP
            </span>
          </div>
        )}
        <div style={{
          height: collapsed ? 3 : 5,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: cur.color, borderRadius: 3 }}
          />
        </div>
        {!collapsed && next && (
          <div style={{ fontFamily: '"Press Start 2P"', fontSize: 6, color: '#404560', marginTop: 3, textAlign: 'right' }}>
            {xpToNext - xpInLevel} XP → LV{next.level}
          </div>
        )}
      </div>
    </>
  )
}

export default XPBar
