import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, Github, Menu, Keyboard } from 'lucide-react'
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
import { C, fonts, tint } from '../utils/theme'

const GITHUB_URL = 'https://github.com/kaorii-ako/Shiori-v1'

const Layout = () => {
  const { aiChatOpen, toggleAIChat, toggleSidebarMobile, theme } = useUIStore()
  const { isDemo, exitDemoMode } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: C.bg,
      position: 'relative',
    }}>
      {/* Sidebar spacer (desktop) */}
      <div className="sidebar-spacer" style={{ flexShrink: 0, transition: 'width 0.22s ease' }} />

      <Sidebar />

      {/* Main content */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
      }}>
        {/* Demo banner */}
        {isDemo && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 24px', gap: 12,
            background: tint(C.purpleDark, 0.14),
            borderBottom: `1px solid ${tint(C.purpleDark, 0.35)}`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: C.purple, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Demo mode — sign in to save your own data
              </span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hide-mobile"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 6,
                  background: tint(C.purpleDark, 0.15),
                  border: `1px solid ${tint(C.purpleDark, 0.3)}`,
                  textDecoration: 'none', flexShrink: 0,
                  fontFamily: fonts.heading, fontSize: 10, fontWeight: 600, color: C.purple,
                }}
              >
                <Star size={10} /> Star on GitHub
              </a>
            </div>
            <button
              onClick={handleExitDemo}
              style={{
                fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: C.pink,
                cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0,
              }}
            >Sign in →</button>
          </div>
        )}

        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid ${C.borderSoft}`,
          background: C.bg,
          position: 'sticky', top: 0, zIndex: 30,
          flexShrink: 0, gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={toggleSidebarMobile}
              className="mobile-hamburger"
              aria-label="Open menu"
              style={{
                display: 'none', padding: 7, borderRadius: 9,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                cursor: 'pointer', color: C.text,
              }}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: C.textMuted }}>{today}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.textFaint, cursor: 'pointer',
                fontFamily: fonts.body, fontSize: 11.5,
              }}
            >
              <Keyboard size={13} /> <span className="hide-mobile">Shortcuts</span> <kbd style={{
                fontFamily: fonts.heading, fontSize: 10, padding: '1px 5px',
                borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
              }}>?</kbd>
            </button>
            <a
              href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              title="Shiori on GitHub" aria-label="GitHub"
              style={{
                display: 'flex', padding: 6, borderRadius: 8, color: C.textFaint,
                border: `1px solid ${C.border}`, transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textFaint }}
            >
              <Github size={15} />
            </a>
          </div>
        </header>

        <div key={location.pathname} className="page-enter page-content" style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* AI Chat slide-in panel */}
      <AnimatePresence>
        {aiChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={toggleAIChat}
              style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.6)' }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="ai-chat-panel"
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 121,
                width: 'min(420px, 100vw)',
                background: C.bgSoft,
                borderLeft: `1px solid ${C.border}`,
                boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <AIChat onClose={toggleAIChat} />
            </motion.div>
          </>
        )}
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
          background: 'rgba(13,17,26,0.97)',
          border: `1px solid ${tint(C.purpleDark, 0.4)}`,
          borderRadius: 14, padding: '16px 20px',
          boxShadow: '0 0 48px rgba(181,92,255,0.18), 0 16px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 4, flexShrink: 0,
            background: tint(C.purpleDark, 0.18),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} style={{ color: C.purple }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>
              Finding this useful?
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: C.textFaint }}>
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
                padding: '7px 12px', borderRadius: 4,
                background: C.purpleDark,
                color: '#fff', textDecoration: 'none',
                fontFamily: fonts.heading, fontSize: 11, fontWeight: 700,
              }}
            >
              <Github size={13} /> Star
            </a>
            <button
              onClick={dismissStarPrompt}
              style={{
                padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', color: C.textFaint,
                fontFamily: fonts.heading, fontSize: 11,
              }}
            >Later</button>
          </div>
        </div>
      )}

      <style>{`
        .sidebar-spacer { width: 240px; }
        .page-content { padding: 24px 24px 48px; }
        @media (max-width: 1279px) { .sidebar-spacer { width: 72px; } }
        @media (max-width: 1023px) {
          .sidebar-spacer { display: none; }
          .mobile-hamburger { display: flex !important; }
          .hide-mobile { display: none; }
        }
        @media (max-width: 640px) {
          .page-content { padding: 16px 14px 40px; }
        }
      `}</style>
    </div>
  )
}

export default Layout
