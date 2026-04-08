import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import AIChat from './AIChat'
import ToastContainer from './ToastContainer'
import { useUIStore } from '../stores'
import { AnimatePresence } from 'framer-motion'

const Layout = () => {
  const { sidebarCollapsed, aiChatOpen } = useUIStore()

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
