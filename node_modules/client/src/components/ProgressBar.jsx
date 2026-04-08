import { motion } from 'framer-motion'

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const getColor = () => {
    if (color) return color
    if (percentage >= 70) return 'bg-accent-success'
    if (percentage >= 40) return 'bg-accent-warning'
    return 'bg-accent-danger'
  }

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor()}`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-text-muted">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
