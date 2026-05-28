import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, User, ChevronDown } from 'lucide-react'
import Avatar from './Avatar'
import Icon from './Icon'
import { useAuthStore } from '../stores'

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsOpen(false)
  }

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    if (user?.username) return user.username
    if (user?.name) return user.name
    return 'User'
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const onSurfaceSecondaryColor = '#8c90a0'
  const onSurfacePrimaryColor = '#dfe2eb'

  const menuItems = [
    { icon: User, label: 'My Profile', onClick: handleSettings, description: 'View and edit your profile' },
    { icon: Settings, label: 'Settings', onClick: handleSettings, description: 'App preferences and connections' }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-sa"
        style={{
          background: isOpen ? 'rgba(175,198,255,0.10)' : 'transparent',
          border: isOpen ? '1px solid rgba(175,198,255,0.30)' : '1px solid transparent',
          color: onSurfacePrimaryColor
        }}
      >
        <Avatar name={getDisplayName()} src={user?.picture} size="sm" />
        <div className="hidden md:block text-left">
          <p
            className="text-sm font-medium"
            style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: onSurfacePrimaryColor }}
          >
            {getDisplayName()}
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: "'Manrope', sans-serif", color: onSurfaceSecondaryColor }}
          >
            {user?.email || 'Student'}
          </p>
        </div>
        <ChevronDown
          className="transition-transform duration-200"
          style={{
            color: onSurfaceSecondaryColor,
            width: 16,
            height: 16
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 mt-2 w-64 z-50"
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(49,53,60,0.95) 0%, rgba(33,38,45,0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(66, 71, 84, 0.30)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 0 30px rgba(175,198,255,0.04)'
              }}
            >
              {/* User Info Header */}
              <div className="p-4 border-b" style={{ borderColor: 'rgba(66,71,84,0.20)' }}>
                <div className="flex items-center gap-3">
                  <Avatar name={getDisplayName()} src={user?.picture} size="lg" />
                  <div>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: onSurfacePrimaryColor }}
                    >
                      {getDisplayName()}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ fontFamily: "'Manrope', sans-serif", color: onSurfaceSecondaryColor }}
                    >
                      {user?.email || 'No email set'}
                    </p>
                    {user?.country && (
                      <p
                        className="text-xs on-surface-tertiary mt-0.5"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        📍 {user.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-sa"
                    style={{ color: onSurfacePrimaryColor }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(175,198,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(175,198,255,0.10)' }}
                    >
                      <Icon icon={item.icon} size={16} style={{ color: '#afc6ff', display: 'block' }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "'Manrope', sans-serif", color: onSurfaceSecondaryColor }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div
                className="p-2 border-t"
                style={{ borderColor: 'rgba(66,71,84,0.20)' }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-sa"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,180,171,0.10)'
                    e.currentTarget.style.color = '#ffb4ab'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = onSurfacePrimaryColor
                  }}
                >
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(255,180,171,0.10)' }}
                  >
                    <Icon icon={LogOut} size={16} style={{ color: '#ffb4ab', display: 'block' }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                    >
                      Log Out
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "'Manrope', sans-serif", color: onSurfaceSecondaryColor }}
                    >
                      Sign out of your account
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDropdown
