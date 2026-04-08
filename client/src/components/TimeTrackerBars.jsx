import { motion } from 'framer-motion'

const TimeTrackerBars = () => {
  const now = new Date()

  // Day progress (0-24 hours)
  const dayProgress = ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100
  const dayLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} / 24H`

  // Month progress
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthProgress = (now.getDate() / monthDays) * 100
  const monthLabel = `${now.getDate()} / ${monthDays} DAYS`

  // Year progress
  const yearStart = new Date(now.getFullYear(), 0, 0)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 0)
  const yearDayOfYear = Math.floor((now - yearStart) / (24 * 60 * 60 * 1000))
  const daysInYear = Math.floor((yearEnd - yearStart) / (24 * 60 * 60 * 1000))
  const yearProgress = (yearDayOfYear / daysInYear) * 100
  const yearLabel = `${yearDayOfYear} / ${daysInYear} DAYS`

  const trackers = [
    { label: 'TODAY', progress: dayProgress, unit: dayLabel, color: '#ff6b9d' },
    { label: 'THIS MONTH', progress: monthProgress, unit: monthLabel, color: '#4d9fff' },
    { label: 'THIS YEAR', progress: yearProgress, unit: yearLabel, color: '#ffe94e' }
  ]

  return (
    <div className="space-y-6">
      {trackers.map((tracker, idx) => (
        <motion.div
          key={tracker.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <div
            className="p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(18,18,31,0.98) 100%)',
              border: '3px solid rgba(196,77,255,0.4)',
              boxShadow: '0 0 15px rgba(196,77,255,0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                style={{
                  fontFamily: '"Press Start 2P"',
                  fontSize: '10px',
                  color: tracker.color
                }}
              >
                {tracker.label}
              </h4>
              <span
                style={{
                  fontFamily: 'VT323',
                  fontSize: '12px',
                  color: '#a0a0b5'
                }}
              >
                {tracker.unit}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid rgba(196,77,255,0.3)',
                height: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tracker.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${tracker.color} 0%, ${tracker.color}cc 100%)`,
                  height: '100%',
                  boxShadow: `0 0 15px ${tracker.color}`,
                  position: 'relative'
                }}
              >
                {/* Animated gradient overlay */}
                <motion.div
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
                    backgroundSize: '200% 100%',
                    height: '100%',
                    position: 'absolute',
                    width: '100%',
                    top: 0,
                    left: 0
                  }}
                />
              </motion.div>
            </div>

            {/* Percentage label */}
            <div
              style={{
                marginTop: '8px',
                textAlign: 'right',
                fontFamily: 'VT323',
                fontSize: '14px',
                color: tracker.color,
                fontWeight: 'bold'
              }}
            >
              {Math.round(tracker.progress)}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default TimeTrackerBars
