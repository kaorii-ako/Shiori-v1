import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Star, Github, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import AIChat from './AIChat'
import PomodoroTimer from './PomodoroTimer'
import ToastContainer from './ToastContainer'
import QuickCapture from './QuickCapture'
import ShortcutModal from './ShortcutModal'
import InstallBanner from './InstallBanner'
import DemoTour from './DemoTour'
import { useUIStore, useAuthStore } from '../stores'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { C } from '../utils/theme'

const GITHUB_URL = 'https://github.com/kaorii-ako/Shiori-v1'

const Layout = () => {
  const { sidebarCollapsed, aiChatOpen, toggleSidebarMobile, theme } = useUIStore()
  const { isDemo, exitDemoMode } = useAuthStore()
  const navigate = useNavigate()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showStarPrompt, setShowStarPrompt] = useState(false)
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

  const sidebarWidth = sidebarCollapsed ? 72 : 240

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: C.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Sidebar spacer (desktop) */}
      <div style={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.25s ease' }}
        className="lg-sidebar-spacer"
      />

      <Sidebar />

      {/* Main content */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        background: C.bg,
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Demo banner */}
        {isDemo && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 24px',
            background: 'linear-gradient(90deg, rgba(196,77,255,0.2) 0%, rgba(255,107,157,0.2) 100%)',
            borderBottom: '1px solid rgba(196,77,255,0.4)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#e5b5ff' }}>
                Demo mode — sign in to save your own data
              </span>
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
              style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#ff6b9d',
                cursor: 'pointer', background: 'none', border: 'none',
              }}
            >Sign in →</button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebarMobile}
          style={{
            display: 'none',
            position: 'fixed', top: 16, left: 16, zIndex: 40,
            padding: 8, borderRadius: 8,
            background: 'rgba(16,20,26,0.9)',
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
          }}
          className="mobile-hamburger"
        >
          <Menu size={20} color={C.blue} />
        </button>

        <div style={{ padding: 24, flex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* Floating elements */}
      <AnimatePresence>
        {aiChatOpen && <AIChat />}
      </AnimatePresence>
      <PomodoroTimer />
      <QuickCapture />
      <ShortcutModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <InstallBanner />
      {isDemo && <DemoTour />}
      <ToastContainer />

      {/* Star prompt */}
      {showStarPrompt && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, width: 'min(420px, 90vw)',
          background: 'rgba(16,20,26,0.97)',
          border: '1px solid rgba(196,77,255,0.40)',
          borderRadius: 14, padding: '16px 20px',
          boxShadow: '0 0 48px rgba(196,77,255,0.18), 0 16px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(196,77,255,0.2), rgba(82,141,255,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} style={{ color: '#e5b5ff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>
              Finding this useful?
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
              Shiori is 100% free &amp; open source. ⭐ helps other students discover it.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismissStarPrompt}
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
              onClick={dismissStarPrompt}
              style={{
                padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: 'rgba(66,71,84,0.30)', color: '#606080',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
              }}
            >Later</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .lg-sidebar-spacer { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default Layout
