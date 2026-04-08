import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  ClipboardList,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useUIStore } from '../stores'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/assignments', icon: ClipboardList, label: 'Tasks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/grades', icon: BarChart3, label: 'Grades' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/settings', icon: Settings, label: 'Config' }
]

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(20,20,35,0.95) 0%, rgba(10,10,20,0.98) 100%)',
        borderRight: '3px solid #c44dff',
        boxShadow: '4px 0 0 0 #0a0a14, 4px 0 0 2px #c44dff'
      }}
    >
      <div className="p-4 flex items-center gap-3 h-20 border-b-2 border-[#c44dff]/30">
        <div
          className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
            clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
            boxShadow: '0 0 20px rgba(255,107,157,0.4), 4px 4px 0 0 #1a1a2e, 4px 4px 0 2px #c44dff, 6px 6px 0 2px #1a1a2e, 0 8px 16px rgba(196,77,255,0.4)',
            transform: 'translate(-2px, -2px)'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
            }}
          />
          <span className="text-white font-bold text-xl relative z-10" style={{ fontFamily: 'serif', textShadow: '1px 1px 0 #993d6b' }}>栞</span>
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span
              className="text-lg gradient-text tracking-wider"
              style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
            >
              SHIORI
            </span>
            <span className="text-[10px] text-text-muted mt-1" style={{ fontFamily: 'VT323' }}>
              AI Study Buddy
            </span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 transition-all duration-100 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-accent-pink/20 to-transparent'
                  : 'hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-10"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(180deg, #ff6b9d 0%, #c44dff 100%)',
                      boxShadow: '0 0 10px rgba(255,107,157,0.5)'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-none ${
                    isActive ? 'bg-accent-purple/30' : 'bg-white/5'
                  }`}
                  style={{
                    boxShadow: isActive ? 'inset 2px 2px 0 #ff9dc4, inset -2px -2px 0 #993d6b' : 'none'
                  }}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-accent-pink' : 'text-text-secondary'}`}
                  />
                </div>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`font-medium text-sm ${
                      isActive ? 'text-accent-pink' : 'text-text-secondary'
                    }`}
                    style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
                  >
                    {label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t-2 border-[#c44dff]/30">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 text-text-muted hover:bg-white/5 hover:text-accent-pink transition-colors"
          style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">HIDE</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
