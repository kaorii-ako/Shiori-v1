import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { SHORTCUT_HELP } from '../hooks/useKeyboardShortcuts'

const extra = [
  { key: 'Shift+T', label: 'Toggle theme' },
  { key: 'Ctrl+K', label: 'Open AI Chat' },
  { key: 'Ctrl+Shift+A', label: 'Quick add assignment' },
  { key: '?', label: 'Show this help' },
]

export default function ShortcutModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 301, width: 'min(520px, 92vw)',
              background: 'rgba(16,20,26,0.97)',
              border: '1px solid rgba(175,198,255,0.20)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(66,71,84,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Keyboard size={16} style={{ color: '#afc6ff' }} />
                <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#afc6ff', letterSpacing: '0.04em' }}>KEYBOARD SHORTCUTS</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#606080', padding: 4 }}>
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#606080', letterSpacing: '0.08em', marginBottom: 10 }}>NAVIGATION</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
                {SHORTCUT_HELP.map(({ key, label }) => (
                  <ShortcutRow key={key} keyStr={key} label={label} />
                ))}
              </div>

              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#606080', letterSpacing: '0.08em', marginBottom: 10 }}>GLOBAL</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {extra.map(({ key, label }) => (
                  <ShortcutRow key={key} keyStr={key} label={label} />
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(66,71,84,0.20)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#424754' }}>Press Esc or click outside to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ShortcutRow({ keyStr, label }) {
  const keys = keyStr.split('+')
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0' }}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {keys.map((k, i) => (
          <kbd key={i} style={{
            padding: '2px 7px', borderRadius: 5,
            background: 'rgba(175,198,255,0.10)',
            border: '1px solid rgba(175,198,255,0.20)',
            fontFamily: 'monospace', fontSize: 11, color: '#afc6ff',
          }}>{k}</kbd>
        ))}
      </div>
    </div>
  )
}
