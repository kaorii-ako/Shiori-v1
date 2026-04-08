import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores'

const Clock = () => {
  const { user } = useAuthStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Get timezone from user country if available
  const getTimezoneOffset = () => {
    if (!user?.country) return 0

    const timezoneMap = {
      'United States': 'America/New_York',
      'United Kingdom': 'Europe/London',
      'Japan': 'Asia/Tokyo',
      'Philippines': 'Asia/Manila',
      'India': 'Asia/Kolkata',
      'Germany': 'Europe/Berlin',
      'France': 'Europe/Paris',
      'Australia': 'Australia/Sydney',
      'Canada': 'America/Toronto',
      'Brazil': 'America/Sao_Paulo'
    }

    const timezone = timezoneMap[user.country] || 'UTC'
    return time.toLocaleString('en-US', { timeZone: timezone })
  }

  const displayTime = getTimezoneOffset()

  return (
    <div
      className="p-6 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(18,18,31,0.98) 100%)',
        border: '3px solid rgba(196,77,255,0.4)',
        boxShadow: '0 0 20px rgba(77,159,255,0.2)'
      }}
    >
      <h3
        className="text-accent-blue mb-4"
        style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
      >
        CURRENT TIME
      </h3>
      <div
        className="text-6xl font-mono mb-2"
        style={{
          fontFamily: 'VT323',
          color: '#00f5ff',
          textShadow: '0 0 20px rgba(0,245,255,0.5)'
        }}
      >
        {displayTime.split(' ')[0]}
      </div>
      <div
        style={{
          fontFamily: 'VT323',
          fontSize: '14px',
          color: '#a0a0b5'
        }}
      >
        {user?.country || 'Timezone'}
      </div>
    </div>
  )
}

export default Clock
