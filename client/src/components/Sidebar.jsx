import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  BookOpen,
  Calendar,
  Target,
  BarChart3,
  TrendingUp,
  StickyNote,
  Layers,
  Settings,
  Menu,
  X,
  Sparkles,
  Flame,
  Brain,
  Trophy,
  Upload,
} from 'lucide-react'
import { useAuthStore, useUIStore } from '../stores'

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: BookOpen, label: 'Assignments', path: '/assignments' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Target, label: 'Grades', path: '/grades' },
  { icon: BarChart3, label: 'Study Plans', path: '/study-plans' },
  { icon: StickyNote, label: 'Notes', path: '/notes' },
  { icon: Layers, label: 'Flashcards', path: '/flashcards' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: Flame, label: 'Habits', path: '/habits' },
  { icon: Brain, label: 'AI Quiz', path: '/quiz' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Upload, label: 'Import Syllabus', path: '/import' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarMobileOpen, closeSidebarMobile, toggleAIChat } = useUIStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Collapse on mobile
  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home'
    return location.pathname.startsWith(path)
  }

  const handleNav = (path) => {
    navigate(path)
    closeSidebarMobile()
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={closeSidebarMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
          lg:relative
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-250
        `}
        style={{
          background: 'linear-gradient(180deg, #14181e 0%, #10141a 100%)',
          borderRight: '1px solid rgba(66, 71, 84, 0.30)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-6 flex-shrink-0">
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(82, 141, 255, 0.20)'
            }}
          >
            <span className="text-[#10141a] font-bold text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>栞</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <h1
                  className="text-lg font-bold gradient-text-primary"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  SHIORI
                </h1>
                <p
                  className="text-xs on-surface-secondary leading-tight"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  AI Study Buddy
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarMobileOpen && (
            <button
              onClick={closeSidebarMobile}
              className="ml-auto lg:hidden p-1"
              style={{ color: '#8c90a0' }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                style={{
                  background: active
                    ? 'linear-gradient(45deg, rgba(175,198,255,0.15) 0%, rgba(82,141,255,0.08) 100%)'
                    : 'transparent',
                  borderLeft: active
                    ? '2px solid #afc6ff'
                    : '2px solid transparent',
                  color: active ? '#afc6ff' : '#8c90a0'
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#dfe2eb'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = '#8c90a0'
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm label-strong whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t" style={{ borderTop: '1px solid rgba(66,71,84,0.30)' }}>
          <div
            className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}
            style={{ borderRadius: '8px', background: 'rgba(18,24,32,0.5)' }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
                color: '#10141a',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p
                    className="text-sm on-surface-primary truncate"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || 'User'}
                  </p>
                  <p
                    className="text-xs on-surface-secondary truncate"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {user?.email || 'Not signed in'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* AI Chat toggle */}
      <button
        onClick={toggleAIChat}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full lg:hidden"
        style={{
          background: 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)',
          boxShadow: '0 8px 32px rgba(82, 141, 255, 0.20)'
        }}
      >
        <Sparkles className="w-6 h-6" style={{ color: '#10141a' }} />
      </button>
    </>
  )
}

export default Sidebar
