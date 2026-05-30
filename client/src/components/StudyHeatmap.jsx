import { useMemo } from 'react'
import { motion } from 'framer-motion'

const LEVELS = [
  { min: 0, color: 'rgba(255,255,255,0.05)', label: 'No activity' },
  { min: 1, color: 'rgba(196,77,255,0.25)', label: '1–20 min' },
  { min: 20, color: 'rgba(196,77,255,0.50)', label: '20–60 min' },
  { min: 60, color: 'rgba(196,77,255,0.75)', label: '60–120 min' },
  { min: 120, color: '#c44dff', label: '120+ min' },
]

function getColor(minutes) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (minutes >= LEVELS[i].min) return LEVELS[i].color
  }
  return LEVELS[0].color
}

function buildWeeks(activityMap) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  // End on the last Saturday
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 52 * 7 + 1) // 53 weeks back

  const weeks = []
  let current = new Date(startDate)

  while (current <= endDate) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0]
      const minutes = activityMap[dateStr] || 0
      const isToday = current.toDateString() === today.toDateString()
      const isFuture = current > today
      week.push({ date: new Date(current), dateStr, minutes, isToday, isFuture })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

function getMonthLabels(weeks) {
  const labels = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstDay = week[0]
    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
      lastMonth = firstDay.date.getMonth()
      labels.push({
        idx: wi,
        label: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
      })
    }
  })
  return labels
}

const CELL = 11
const GAP = 3
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const StudyHeatmap = ({ activityMap = {}, totalMinutes = 0 }) => {
  const weeks = useMemo(() => buildWeeks(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])

  const activeDays = useMemo(() =>
    Object.values(activityMap).filter(m => m > 0).length, [activityMap])

  const maxStreak = useMemo(() => {
    const dates = Object.keys(activityMap).filter(d => activityMap[d] > 0).sort()
    let max = 0, cur = 0
    dates.forEach((d, i) => {
      if (i === 0) { cur = 1; return }
      const prev = new Date(dates[i - 1])
      const curr = new Date(d)
      const diff = (curr - prev) / 86400000
      cur = diff === 1 ? cur + 1 : 1
      if (cur > max) max = cur
    })
    return Math.max(max, cur)
  }, [activityMap])

  const totalH = Math.floor(totalMinutes / 60)
  const totalM = totalMinutes % 60

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#606080' }}>
          STUDY ACTIVITY — PAST YEAR
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Active Days', value: activeDays, color: '#c44dff' },
            { label: 'Longest Streak', value: `${maxStreak}d`, color: '#e5b5ff' },
            { label: 'Total Focus', value: `${totalH}h ${totalM}m`, color: '#afc6ff' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: s.color }}>{s.value}</p>
              <p style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: 28, marginBottom: 4 }}>
            {monthLabels.map((ml, i) => {
              const nextIdx = monthLabels[i + 1]?.idx ?? weeks.length
              const width = (nextIdx - ml.idx) * (CELL + GAP)
              return (
                <div key={i} style={{ width, fontFamily: 'VT323', fontSize: 12, color: '#606080', flexShrink: 0 }}>
                  {ml.label}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: GAP }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4 }}>
              {DAY_LABELS.map((label, i) => (
                <div key={i} style={{ height: CELL, fontFamily: 'VT323', fontSize: 10, color: '#424754', lineHeight: `${CELL}px`, width: 20, textAlign: 'right' }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.map((day, di) => (
                  <motion.div
                    key={di}
                    title={`${day.dateStr}: ${day.minutes} min`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.001, duration: 0.2 }}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      background: day.isFuture ? 'transparent' : getColor(day.minutes),
                      border: day.isToday ? '1px solid #c44dff' : '1px solid transparent',
                      cursor: day.minutes > 0 ? 'pointer' : 'default',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>Less</span>
            {LEVELS.map((l, i) => (
              <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: l.color }} title={l.label} />
            ))}
            <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyHeatmap
