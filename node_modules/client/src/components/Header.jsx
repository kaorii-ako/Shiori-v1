import { useState } from 'react'
import { Search, Bell, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from './Avatar'
import ProfileDropdown from './ProfileDropdown'
import { useAuthStore, useUIStore } from '../stores'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore()
  const { toggleAIChat } = useUIStore()

  return (
    <header
      className="h-20 flex items-center justify-between px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(20,20,35,0.9) 0%, rgba(10,10,20,0.8) 100%)',
        borderBottom: '2px solid rgba(196,77,255,0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: '#606080' }}
          />
          <input
            type="text"
            placeholder="Search assignments, tasks, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass w-full pl-12 pr-4 py-3"
            style={{ fontFamily: 'VT323', fontSize: '18px' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAIChat}
          className="flex items-center gap-3 px-5 py-3 text-white font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            boxShadow: 'inset -2px -2px 0 #993d6b, inset 2px 2px 0 #ff9dc4, 0 4px 0 #1a1a2e',
            textTransform: 'uppercase'
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI</span>
        </motion.button>

        <button
          className="relative p-3 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          <Bell className="w-5 h-5 text-text-secondary" />
          <span
            className="absolute top-2 right-2 w-2 h-2"
            style={{ background: '#ff4d6a', boxShadow: '0 0 10px #ff4d6a' }}
          />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  )
}

export default Header
