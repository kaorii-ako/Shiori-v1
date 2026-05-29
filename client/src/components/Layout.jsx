import { useEffect, useRef, useState, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Github, Menu, Sun, Moon } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import AIChat from './AIChat'
import PomodoroTimer from './PomodoroTimer'
import ToastContainer from './ToastContainer'
import QuickCapture from './QuickCapture'
import ShortcutModal from './ShortcutModal'
import { useUIStore, useAuthStore } from '../stores'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const GITHUB_URL = 'https://github.com/kaorii-ako/Shiori-v1'

const StarPrompt = ({ onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 16, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
    style={{
      position: 'fixed', bottom: 24, left: '50%', translateX: '-50%',
      zIndex: 200, width: 'min(420px, 90vw)',
      background: 'rgba(16,20,26,0.97)',
      border: '1px solid rgba(196,77,255,0.40)',
      borderRadius: 14, padding: '16px 20px',
      boxShadow: '0 0 48px rgba(196,77,255,0.18), 0 16px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', gap: 14,
      transform: 'translateX(-50%)',
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(196,77,255,0.2), rgba(82,141,255,0.15))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Star size={18} style={{ color: '#e5b5ff' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#dfe2eb', marginBottom: 2 }}>
        Finding this useful?
      </p>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
        Shiori is 100% free &amp; open source. ⭐ helps other students discover it — takes 2 seconds.
      </p>
    </div>
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onDismiss}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 12px', borderRadius: 7,
          background: 'linear-gradient(135deg, #c44dff 0%, #7b3fa8 100%)',
          color: '#fff', textDecoration: 'none',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700,
        }}
      >
        <Github size={13} /> Star
      </a>
      <button
        onClick={onDismiss}
        style={{
          padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
          background: 'rgba(66,71,84,0.30)', color: '#606080',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
        }}
      >
        Later
      </button>
    </div>
  </motion.div>
)

const Layout = () => {
  const { sidebarCollapsed, aiChatOpen, toggleSidebarMobile, theme, toggleTheme } = useUIStore()
  const { isDemo, exitDemoMode } = useAuthStore()
  const navigate = useNavigate()
  const [showStarPrompt, setShowStarPrompt] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const promptFired = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'dark')
  }, [theme])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
      if (e.key === '?') setShowShortcuts(s => !s)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useKeyboardShortcuts()

  const handleExitDemo = () => {
    exitDemoMode()
    navigate('/login')
  }

  useEffect(() => {
    if (!isDemo || promptFired.current) return
    if (sessionStorage.getItem('shiori-star-dismissed')) return
    const timer = setTimeout(() => {
      promptFired.current = true
      setShowStarPrompt(true)
    }, 40000)
    return () => clearTimeout(timer)
  }, [isDemo])

  const dismissStarPrompt = () => {
    sessionStorage.setItem('shiori-star-dismissed', '1')
    setShowStarPrompt(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      <div className="starfield" />
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />

      <Sidebar />

      <main
        className={`transition-all duration-200 min-h-screen relative z-10 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
        } ml-0`}
      >
        {isDemo && (
          <div
            className="flex items-center justify-between px-6 py-2"
            style={{
              background: 'linear-gradient(90deg, rgba(196,77,255,0.2) 0%, rgba(255,107,157,0.2) 100%)',
              borderBottom: '1px solid rgba(196,77,255,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontFamily: 'VT323', fontSize: '16px', color: '#c44dff' }}>
                DEMO MODE — Explore freely!
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(196,77,255,0.15)',
                  border: '1px solid rgba(196,77,255,0.30)',
                  textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600, color: '#e5b5ff',
                }}
              >
                <Star size={10} /> Star on GitHub
              </a>
            </div>
            <button
              onClick={handleExitDemo}
              style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff6b9d', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              EXIT DEMO
            </button>
          </div>
        )}
        {/* Mobile hamburger */}
        <button
          className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg"
          style={{ background: 'rgba(16,20,26,0.9)', border: '1px solid rgba(66,71,84,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={toggleSidebarMobile}
        >
          <Menu size={20} color="#afc6ff" />
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 40,
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'rgba(175,198,255,0.10)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          {theme === 'dark'
            ? <Sun size={16} color="#ffd6a0" />
            : <Moon size={16} color="#528dff" />
          }
        </button>
        <Header />
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <AnimatePresence>
        {aiChatOpen && <AIChat />}
      </AnimatePresence>
      <PomodoroTimer />
      <AnimatePresence>
        {showStarPrompt && <StarPrompt onDismiss={dismissStarPrompt} />}
      </AnimatePresence>
      <QuickCapture />
      <ShortcutModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <ToastContainer />
    </div>
  )
}

export default Layout
