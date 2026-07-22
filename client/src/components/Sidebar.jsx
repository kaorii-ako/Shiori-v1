import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, ClipboardList, CalendarDays, BarChart3, FileText, Layers,
  Puzzle, CheckCircle2, TrendingUp, BookOpen, Trophy, Target,
  Upload, User, Settings, X,
} from 'lucide-react'
import { useAuthStore, useUIStore } from '../stores'
import { C, fonts, tint } from '../utils/theme'

const navSections = [
  {
    label: 'Overview',
    items: [
      { icon: Home, label: 'Home', path: '/home' },
      { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
      { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
      { icon: BarChart3, label: 'Grades', path: '/grades' },
    ],
  },
  {
    label: 'Study',
    items: [
      { icon: FileText, label: 'Notes', path: '/notes' },
      { icon: Layers, label: 'Flashcards', path: '/flashcards' },
      { icon: Puzzle, label: 'Quiz', path: '/quiz' },
      { icon: BookOpen, label: 'Study Plans', path: '/study-plans' },
      { icon: Target, label: 'Focus Mode', path: '/focus' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { icon: CheckCircle2, label: 'Habits', path: '/habits' },
      { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
      { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Upload, label: 'Import', path: '/import' },
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarMobileOpen, closeSidebarMobile } = useUIStore()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setCollapsed(mobile ? false : window.innerWidth < 1280)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home'
    if (path === '/study-plans') return location.pathname.startsWith('/study')
    return location.pathname.startsWith(path)
  }

  const handleNav = (path) => {
    navigate(path)
    closeSidebarMobile()
  }

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || user?.username || 'Student'
  const userInitial = userName[0]?.toUpperCase() || 'S'

  const showLabels = !collapsed || isMobile
  const sidebarWidth = showLabels ? 240 : 72

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          onClick={closeSidebarMobile}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(4,6,10,0.75)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0,
          height: '100%',
          width: sidebarWidth,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: '#0d111a',
          borderRight: `1px solid ${C.borderSoft}`,
          transition: 'width 0.22s ease, transform 0.25s ease',
          transform: isMobile && !sidebarMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 16px',
          borderBottom: `1px solid ${C.borderSoft}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 4, flexShrink: 0,
            background: C.blueDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: '#0b0e14', fontWeight: 700, fontSize: 17,
              fontFamily: fonts.heading,
            }}>栞</span>
          </div>
          {showLabels && (
            <div>
              <div style={{
                fontFamily: fonts.heading, fontWeight: 700, fontSize: 15,
                color: C.text, letterSpacing: '0.06em',
              }}>SHIORI</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: C.textFaint }}>
                Your study space
              </div>
            </div>
          )}
          {sidebarMobileOpen && (
            <button
              onClick={closeSidebarMobile}
              aria-label="Close menu"
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: C.textMuted, cursor: 'pointer', padding: 4, display: 'flex',
              }}
            ><X size={18} /></button>
          )}
        </div>

        {/* Nav */}
        <nav className="scrollbar-dense" style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 12px' }}>
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: 10 }}>
              {showLabels && (
                <div style={{
                  fontFamily: fonts.heading, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: C.textFaint, padding: '8px 12px 4px',
                }}>{section.label}</div>
              )}
              {section.items.map((item) => {
                const active = isActive(item.path)
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    title={!showLabels ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: showLabels ? '9px 12px' : '10px 0',
                      justifyContent: showLabels ? 'flex-start' : 'center',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: 2,
                      background: active ? tint(C.blueDark, 0.14) : 'transparent',
                      color: active ? C.blue : C.textMuted,
                      boxShadow: active ? `inset 2px 0 0 ${C.blueDark}` : 'none',
                      transition: 'background 0.13s ease, color 0.13s ease',
                      fontFamily: fonts.body,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.color = C.text
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = C.textMuted
                      }
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.4 : 2} style={{ flexShrink: 0 }} />
                    {showLabels && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '12px 10px',
          borderTop: `1px solid ${C.borderSoft}`,
          flexShrink: 0,
        }}>
          <button
            onClick={() => handleNav('/profile')}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: showLabels ? '8px 10px' : '8px 0',
              justifyContent: showLabels ? 'flex-start' : 'center',
              borderRadius: 10,
              border: `1px solid ${C.borderSoft}`,
              background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'background 0.13s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 4, flexShrink: 0,
              background: C.purpleDark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0b0e14', fontWeight: 700, fontSize: 13,
              fontFamily: fonts.heading,
            }}>
              {userInitial}
            </div>
            {showLabels && (
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{
                  fontFamily: fonts.body,
                  fontSize: 12.5, fontWeight: 700, color: C.text,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{userName}</div>
                <div style={{
                  fontFamily: fonts.body,
                  fontSize: 11, color: C.textFaint,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{user?.email || 'View profile'}</div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
