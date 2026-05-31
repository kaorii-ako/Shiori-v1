import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useUIStore } from '../stores'
import { C } from '../utils/theme'

const navItems = [
  { icon: '🏠', label: 'Home', path: '/home' },
  { icon: '📋', label: 'Assignments', path: '/assignments' },
  { icon: '📅', label: 'Calendar', path: '/calendar' },
  { icon: '📊', label: 'Grades', path: '/grades' },
  { icon: '📝', label: 'Notes', path: '/notes' },
  { icon: '🃏', label: 'Flashcards', path: '/flashcards' },
  { icon: '🧩', label: 'Quiz', path: '/quiz' },
  { icon: '✅', label: 'Habits', path: '/habits' },
  { icon: '📈', label: 'Analytics', path: '/analytics' },
  { icon: '📚', label: 'Study Plans', path: '/study-plans' },
  { icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
  { icon: '🎯', label: 'Focus Mode', path: '/focus' },
  { icon: '📤', label: 'Import', path: '/import' },
  { icon: '👤', label: 'Profile', path: '/profile' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarMobileOpen, closeSidebarMobile } = useUIStore()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024)
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

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || user?.username || 'Student'
  const userInitial = userName[0]?.toUpperCase() || 'S'

  const sidebarWidth = collapsed ? 72 : 240

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          onClick={closeSidebarMobile}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, display: 'block',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarMobileOpen ? 0 : (collapsed ? 0 : 0),
          height: '100%',
          width: sidebarWidth,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          transition: 'width 0.25s ease',
          transform: !sidebarMobileOpen && window.innerWidth < 1024 ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 16px 20px',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(82,141,255,0.3)',
          }}>
            <span style={{
              color: '#10141a', fontWeight: 700, fontSize: 16,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>栞</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15,
                color: C.blue,
                letterSpacing: '0.05em',
              }}>SHIORI</div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 11, color: C.textMuted,
              }}>AI Study Buddy</div>
            </div>
          )}
          {sidebarMobileOpen && (
            <button
              onClick={closeSidebarMobile}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: C.textMuted, cursor: 'pointer', fontSize: 18, lineHeight: 1,
              }}
            >✕</button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 2,
                  background: active ? C.cardHover : 'transparent',
                  borderLeft: active ? `3px solid ${C.blue}` : '3px solid transparent',
                  color: active ? C.blue : C.textMuted,
                  transition: 'all 0.15s ease',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = C.card
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
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: '12px 8px',
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8,
            background: C.card,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10141a', fontWeight: 700, fontSize: 12,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {userInitial}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12, fontWeight: 600, color: C.text,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{userName}</div>
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 11, color: C.textMuted,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{user?.email || 'Demo User'}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
