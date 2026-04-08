import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const GlassCard = forwardRef(({
  children,
  className = '',
  hover = true,
  padding = 'p-6',
  pixel = true,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        relative ${padding} ${className}
        ${pixel ? 'pixel-card' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(18,18,31,0.98) 100%)',
        border: '3px solid rgba(196,77,255,0.4)',
        boxShadow: hover
          ? '0 0 20px rgba(196,77,255,0.2), inset 0 0 30px rgba(196,77,255,0.05)'
          : 'none',
        imageRendering: 'pixelated'
      }}
      {...props}
    >
      {hover && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
          whileHover={{ opacity: 1 }}
        />
      )}
      {children}
    </motion.div>
  )
})

GlassCard.displayName = 'GlassCard'

export default GlassCard
