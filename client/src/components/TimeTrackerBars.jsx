import { motion } from 'framer-motion'

const TimeTrackerBars = () => {
  const now = new Date()

  const dayProgress = ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100
  const dayLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} / 24H`

  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthProgress = (now.getDate() / monthDays) * 100
  const monthLabel = `${now.getDate()} / ${monthDays} DAYS`

  const yearStart = new Date(now.getFullYear(), 0, 0)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 0)
  const yearDayOfYear = Math.floor((now - yearStart) / (24 * 60 * 60 * 1000))
  const daysInYear = Math.floor((yearEnd - yearStart) / (24 * 60 * 60 * 1000))
  const yearProgress = (yearDayOfYear / daysInYear) * 100
  const yearLabel = `${yearDayOfYear} / ${daysInYear} DAYS`

  const trackers = [
    { label: 'TODAY', progress: dayProgress, unit: dayLabel, color: '#afc6ff' },
    { label: 'THIS MONTH', progress: monthProgress, unit: monthLabel, color: '#d7ffc5' },
    { label: 'THIS YEAR', progress: yearProgress, unit: yearLabel, color: '#e5b5ff' }
  ]

  return (
    <div className="space-y-4">
      {trackers.map((tracker, idx) => (
        <motion.div
          key={tracker.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: 'rgba(24, 28, 34, 0.60)',
              border: '1px solid rgba(66, 71, 84, 0.25)',
              fontFamily: "'Manrope', sans-serif"
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.7rem', color: tracker.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {tracker.label}
              </h4>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.7rem', color: '#606080' }}>
                {tracker.unit}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                height: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tracker.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  background: tracker.color,
                  height: '100%',
                  borderRadius: '4px'
                }}
              />
            </div>

            {/* Percentage label */}
            <div
              style={{
                marginTop: '6px',
                textAlign: 'right',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                color: tracker.color
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
