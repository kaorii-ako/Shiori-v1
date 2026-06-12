import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

const DISMISSED_KEY = 'shiori-pwa-dismissed'

const InstallBanner = () => {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 180,
            maxWidth: 420, margin: '0 auto',
            background: 'rgba(16,20,26,0.97)',
            border: '1px solid rgba(175,198,255,0.25)',
            borderRadius: 14, padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(175,198,255,0.2), rgba(82,141,255,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Download size={17} style={{ color: '#afc6ff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#dfe2eb', marginBottom: 1 }}>
              Install Shiori
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
              Add to home screen — works offline
            </p>
          </div>
          <button
            onClick={install}
            style={{
              padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #528dff, #afc6ff)',
              color: '#0b0e14', fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}
          >
            Install
          </button>
          <button
            onClick={dismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#424754', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InstallBanner
