import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import Avatar from './Avatar'
import ProfileDropdown from './ProfileDropdown'
import Clock from './Clock'
import { useAuthStore } from '../stores'

const Header = () => {
  const { user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    if (user?.username) return user.username
    if (user?.name) return user.name
    return 'Student'
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`
        h-16 flex items-center justify-between px-6 z-30
        transition-all duration-200
      `}
      style={{
        background: isScrolled
          ? 'rgba(24, 28, 34, 0.90)'
          : 'rgba(24, 28, 34, 0.40)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(66, 71, 84, 0.25)'
      }}
    >
      {/* Left: greeting */}
      <div>
        <h2
          className="text-xl on-surface-primary"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
        >
          Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}
        </h2>
        <p
          className="text-xs on-surface-secondary"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {displayName()}
        </p>
      </div>

      {/* Right: search, clock, notifications, profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#606080', width: 16, height: 16 }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="input-sa pr-8 text-sm"
            style={{ width: 200, borderRadius: '4px' }}
          />
        </div>

        {/* Clock */}
        <Clock />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-sa"
          style={{ color: '#8c90a0' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(24, 28, 34, 0.60)'
            e.currentTarget.style.color = '#dfe2eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#8c90a0'
          }}
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ffc44d', boxShadow: '0 0 6px rgba(255,196,77,0.5)' }}
          />
        </button>

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </motion.header>
  )
}

export default Header
