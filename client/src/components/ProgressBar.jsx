import { motion } from 'framer-motion'

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const getColor = () => {
    if (percentage >= 70) return '#4ad778'
    if (percentage >= 40) return '#ffb44d'
    return '#ffb4ab'
  }

  const barColors = {
    success: '#4ad778',
    warning: '#ffb44d',
    danger: '#ffb4ab',
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.3)',
          height: size === 'sm' ? 4 : size === 'lg' ? 12 : 8,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: percentage >= 70 ? barColors.success : percentage >= 40 ? barColors.warning : barColors.danger,
            borderRadius: '4px',
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#606080', fontFamily: "'Manrope', sans-serif" }}>
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
