import { motion } from 'framer-motion'

const GlassCard = ({
  children,
  className = '',
  hover = false,
  noShadow = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { translateY: -2, borderColor: 'rgba(66, 71, 84, 0.6)' } : {}}
      className={`
        relative overflow-hidden transition-sa
        ${className}
      `}
      style={{
        background: '#181c22',
        border: '1px solid rgba(66, 71, 84, 0.4)',
        borderRadius: '6px',
        padding: '1.5rem',
        ...(!noShadow && {
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.3)',
        })
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
