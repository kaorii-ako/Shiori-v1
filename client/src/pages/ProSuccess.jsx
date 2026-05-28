import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'

const ProSuccess = () => (
  <div style={{ minHeight: '100vh', background: '#10141a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
        background: 'linear-gradient(135deg, rgba(74,215,120,0.2), rgba(82,141,255,0.1))',
        border: '1px solid rgba(74,215,120,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(74,215,120,0.15)',
      }}>
        <CheckCircle2 size={36} style={{ color: '#4dff91' }} />
      </div>

      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: '#dfe2eb', marginBottom: 12, lineHeight: 1.4 }}>
        YOU'RE PRO!
      </div>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, color: '#8c90a0', lineHeight: 1.7, marginBottom: 32 }}>
        Welcome to Shiori Pro. Your 7-day free trial has started — no charge until it ends.
        You'll receive a confirmation email shortly.
      </p>

      <div style={{
        padding: '16px 20px', borderRadius: 10, marginBottom: 32,
        background: 'rgba(74,215,120,0.06)',
        border: '1px solid rgba(74,215,120,0.2)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Unlimited AI study plans', 'Unlimited AI chat', 'Smart priority scoring', 'Email deadline reminders'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={13} style={{ color: '#4dff91', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/login"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 32px', borderRadius: 8,
          background: 'linear-gradient(135deg, #c44dff 0%, #7b3fa8 100%)',
          color: '#fff', textDecoration: 'none',
          fontFamily: '"Press Start 2P", monospace', fontSize: 11,
          letterSpacing: '0.04em',
          boxShadow: '0 0 40px rgba(196,77,255,0.25)',
        }}
      >
        OPEN SHIORI <ArrowRight size={14} />
      </Link>

      <p style={{ marginTop: 20, fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#424754' }}>
        Questions? Email 79807@student.amnuaysilpa.ac.th
      </p>
    </motion.div>
  </div>
)

export default ProSuccess
