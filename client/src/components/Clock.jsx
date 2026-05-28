import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores'

const Clock = () => {
  const { user } = useAuthStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
      className="px-3 py-2 text-center rounded-lg"
      style={{
        background: 'rgba(24, 28, 34, 0.60)',
        border: '1px solid rgba(66, 71, 84, 0.25)',
        fontFamily: "'Space Grotesk', sans-serif"
      }}
    >
      <p className="text-[0.6rem] on-surface-tertiary mb-0.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        CURRENT TIME
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#afc6ff',
          textShadow: '0 0 8px rgba(175, 198, 255, 0.3)'
        }}
      >
        {displayTime.split(' ')[0]}
      </p>
      <p
        style={{
          fontSize: '0.625rem',
          color: '#606080',
          fontFamily: "'Manrope', sans-serif"
        }}
      >
        {user?.country || 'Timezone'}
      </p>
    </div>
  )
}

export default Clock
