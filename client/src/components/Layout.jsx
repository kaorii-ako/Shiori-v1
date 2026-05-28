import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import AIChat from './AIChat'
import ToastContainer from './ToastContainer'
import { useUIStore, useAuthStore } from '../stores'
import { AnimatePresence } from 'framer-motion'

const Layout = () => {
  const { sidebarCollapsed, aiChatOpen } = useUIStore()
  const { isDemo, exitDemoMode } = useAuthStore()
  const navigate = useNavigate()

  const handleExitDemo = () => {
    exitDemoMode()
    navigate('/login')
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
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[240px]'
        }`}
      >
        {isDemo && (
          <div
            className="flex items-center justify-between px-6 py-2"
            style={{
              background: 'linear-gradient(90deg, rgba(196,77,255,0.2) 0%, rgba(255,107,157,0.2) 100%)',
              borderBottom: '1px solid rgba(196,77,255,0.4)'
            }}
          >
            <p style={{ fontFamily: 'VT323', fontSize: '16px', color: '#c44dff' }}>
              DEMO MODE — Data is not saved. Explore freely!
            </p>
            <button
              onClick={handleExitDemo}
              style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff6b9d', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              EXIT DEMO
            </button>
          </div>
        )}
        <Header />

        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <AnimatePresence>
        {aiChatOpen && <AIChat />}
      </AnimatePresence>
      <ToastContainer />
    </div>
  )
}

export default Layout
