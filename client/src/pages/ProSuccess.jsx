import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Settings } from 'lucide-react'

const PRO_UNLOCKED = [
  'Unlimited AI study plans — generate as many as you need',
  'Unlimited AI chat — no daily message cap',
  'Smart priority scoring — AI ranks tasks by weight & deadline',
  'Email deadline reminders — 24h and 2h before due',
  'Grade predictions — AI estimates your final grades',
]

export default function ProSuccess() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0e14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Manrope', sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,255,145,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          maxWidth: 520, width: '100%',
          background: '#12161f',
          border: '1px solid #222a3a',
          borderRadius: 20,
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(77,255,145,0.08)',
        }}
      >
        {/* Check circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            width: 88, height: 88, borderRadius: '50%',
            margin: '0 auto 32px',
            background: 'rgba(77,255,145,0.1)',
            border: '2px solid rgba(77,255,145,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(77,255,145,0.2)',
          }}
        >
          <span style={{ fontSize: 40, lineHeight: 1 }}>✓</span>
        </motion.div>

        {/* Headline */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 26, fontWeight: 700,
          color: '#dfe2eb', marginBottom: 12, lineHeight: 1.3,
        }}>
          You're now a Shiori Pro member! 🎉
        </div>

        {/* Subtext */}
        <p style={{
          fontSize: 15, color: '#8c90a0', lineHeight: 1.7, marginBottom: 32,
        }}>
          Your 7-day free trial has started. Welcome to the Pro family.<br />
          No charge until your trial ends — cancel anytime.
        </p>

        {/* Features unlocked */}
        <div style={{
          padding: '20px 24px',
          borderRadius: 12,
          background: 'rgba(77,255,145,0.05)',
          border: '1px solid rgba(77,255,145,0.18)',
          marginBottom: 32,
          textAlign: 'left',
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11, fontWeight: 700,
            color: '#4dff91', letterSpacing: '0.1em',
            marginBottom: 14,
          }}>
            WHAT YOU UNLOCKED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRO_UNLOCKED.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Sparkles size={13} style={{ color: '#4dff91', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#8c90a0', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/home"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 8,
              background: 'linear-gradient(135deg, #c44dff 0%, #7b3fa8 100%)',
              color: '#fff', textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(196,77,255,0.3)',
            }}
          >
            Go to Dashboard <ArrowRight size={14} />
          </Link>
          <Link
            to="/settings"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 8,
              border: '1px solid #222a3a',
              background: 'transparent',
              color: '#8c90a0', textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Settings size={14} /> View Settings
          </Link>
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: '#424754' }}>
          Questions? Email 79807@student.amnuaysilpa.ac.th
        </p>
      </motion.div>
    </div>
  )
}
