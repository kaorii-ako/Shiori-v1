import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const GradeTrendChart = ({ courses = [], height = 160 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = height

    ctx.clearRect(0, 0, w, h)

    const padL = 36, padR = 16, padT = 12, padB = 28
    const chartW = w - padL - padR
    const chartH = h - padT - padB

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let g = 0; g <= 4; g++) {
      const y = padT + (chartH / 4) * g
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(padL + chartW, y)
      ctx.stroke()
      // Y axis label
      const label = Math.round(100 - (g / 4) * 40) + '%'
      ctx.fillStyle = '#424754'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(label, padL - 6, y + 3.5)
    }

    if (!courses.length) {
      ctx.fillStyle = '#424754'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Add grades to see your trend', w / 2, h / 2)
      return
    }

    const now = new Date()
    const totalMonths = 5

    // For each course, draw a line
    courses.forEach((course, ci) => {
      if (!course.grades || !course.grades.length) return

      // Group grades by month and compute average
      const byMonth = {}
      course.grades.forEach(g => {
        const date = new Date(g.date || Date.now())
        const key = `${date.getFullYear()}-${date.getMonth()}`
        if (!byMonth[key]) byMonth[key] = []
        byMonth[key].push(g.percentage || g.score || 0)
      })

      // Build points for last N months
      const points = []
      for (let i = totalMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const vals = byMonth[key]
        const avg = vals ? vals.reduce((s, v) => s + v, 0) / vals.length : null
        points.push({ month: d.getMonth(), avg })
      }

      const validPoints = points.filter(p => p.avg !== null)
      if (validPoints.length < 2) return

      const getX = (idx) => padL + (idx / (totalMonths - 1)) * chartW
      const getY = (pct) => padT + chartH - ((pct - 60) / 40) * chartH

      // Draw glow gradient fill
      const fillPoints = points.filter((_, i) => i === 0 || points[i].avg !== null)
      if (validPoints.length >= 2) {
        const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH)
        grad.addColorStop(0, `${course.color || '#c44dff'}30`)
        grad.addColorStop(1, `${course.color || '#c44dff'}00`)

        ctx.beginPath()
        let started = false
        points.forEach((p, i) => {
          if (p.avg === null) return
          const x = getX(i)
          const y = getY(Math.max(60, Math.min(100, p.avg)))
          if (!started) { ctx.moveTo(x, y); started = true }
          else ctx.lineTo(x, y)
        })
        const lastValid = [...points].reverse().find(p => p.avg !== null)
        const lastIdx = points.lastIndexOf(lastValid)
        ctx.lineTo(getX(lastIdx), padT + chartH)
        ctx.lineTo(getX(points.findIndex(p => p.avg !== null)), padT + chartH)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = course.color || '#c44dff'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        started = false
        points.forEach((p, i) => {
          if (p.avg === null) return
          const x = getX(i)
          const y = getY(Math.max(60, Math.min(100, p.avg)))
          if (!started) { ctx.moveTo(x, y); started = true }
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Dots on data points
        points.forEach((p, i) => {
          if (p.avg === null) return
          const x = getX(i)
          const y = getY(Math.max(60, Math.min(100, p.avg)))
          ctx.beginPath()
          ctx.arc(x, y, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = course.color || '#c44dff'
          ctx.fill()
        })
      }
    })

    // Month labels
    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (totalMonths - 1 - i), 1)
      const x = padL + (i / (totalMonths - 1)) * chartW
      ctx.fillStyle = '#424754'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(MONTH_LABELS[d.getMonth()], x, h - 6)
    }
  }, [courses, height])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#606080' }}>GRADE TRENDS — LAST 5 MONTHS</p>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {courses.slice(0, 5).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: c.color || '#c44dff' }} />
              <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#606080' }}>
                {c.code || c.name?.split(' ')[0] || `Course ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <motion.canvas
        ref={canvasRef}
        style={{ width: '100%', height, display: 'block' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

export default GradeTrendChart
