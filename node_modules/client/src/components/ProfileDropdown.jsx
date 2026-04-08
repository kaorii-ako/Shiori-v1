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

  // Close dropdown when clicking outside
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
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.username) {
      return user.username
    }
    if (user?.name) {
      return user.name
    }
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

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      onClick: handleSettings,
      description: 'View and edit your profile'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: handleSettings,
      description: 'App preferences and connections'
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all
          ${isOpen
            ? 'bg-white/10 border-2 border-accent-purple'
            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
          }
        `}
      >
        <Avatar
          name={getDisplayName()}
          src={user?.picture}
          size="sm"
        />
        <div className="hidden md:block text-left">
          <p
            className="text-sm font-medium text-white"
            style={{ fontFamily: 'VT323', fontSize: '16px' }}
          >
            {getDisplayName()}
          </p>
          <p
            className="text-xs text-text-muted"
            style={{ fontFamily: 'VT323', fontSize: '12px' }}
          >
            {user?.email || 'Student'}
          </p>
        </div>
        <ChevronDown
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: '#606080', width: 16, height: 16 }}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 z-50"
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(26,26,46,0.98) 0%, rgba(18,18,31,0.99) 100%)',
                border: '2px solid rgba(196,77,255,0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(196,77,255,0.2)'
              }}
            >
              {/* User Info Header */}
              <div
                className="p-4 border-b"
                style={{ borderColor: 'rgba(196,77,255,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={getDisplayName()}
                    src={user?.picture}
                    size="lg"
                  />
                  <div>
                    <p
                      className="font-semibold text-white"
                      style={{ fontFamily: 'VT323', fontSize: '18px' }}
                    >
                      {getDisplayName()}
                    </p>
                    <p
                      className="text-xs text-text-muted truncate"
                      style={{ fontFamily: 'VT323', fontSize: '12px' }}
                    >
                      {user?.email || 'No email set'}
                    </p>
                    {user?.country && (
                      <p
                        className="text-xs text-accent-blue mt-0.5"
                        style={{ fontFamily: 'VT323', fontSize: '11px' }}
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
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      text-left transition-all hover:bg-white/10
                      ${index !== menuItems.length - 1 ? 'mb-1' : ''}
                    `}
                  >
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(196,77,255,0.2)' }}
                    >
                      <Icon icon={item.icon} size={16} style={{ color: '#c44dff', display: 'block' }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm text-white"
                        style={{ fontFamily: 'VT323', fontSize: '16px' }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs text-text-muted"
                        style={{ fontFamily: 'VT323', fontSize: '12px' }}
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
                style={{ borderColor: 'rgba(196,77,255,0.2)' }}
              >
                <button
                  onClick={handleLogout}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg
                    text-left transition-all hover:bg-white/10
                  `}
                  style={{
                    background: 'rgba(255,77,106,0.1)',
                    border: '1px solid rgba(255,77,106,0.2)'
                  }}
                >
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(255,77,106,0.2)' }}
                  >
                    <Icon icon={LogOut} size={16} style={{ color: '#ff4d6a', display: 'block' }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ fontFamily: 'VT323', fontSize: '16px', color: '#ff4d6a' }}
                    >
                      Log Out
                    </p>
                    <p
                      className="text-xs text-text-muted"
                      style={{ fontFamily: 'VT323', fontSize: '12px' }}
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
