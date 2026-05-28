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
      whileHover={hover ? {
        translateY: -2,
        backgroundColor: 'rgba(9, 30, 66, 0.45)'
      } : {}}
      className={`
        relative overflow-hidden transition-sa
        ${className}
      `}
      style={{
        background: 'rgba(24, 28, 34, 0.55)',
        backdropFilter: 'blur(16px)',
        borderRadius: '8px',
        padding: '1.5rem',
        ...(!noShadow && {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        })
      }}
      {...props}
    >
      {/* Top-left ambient glow */}
      <div
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full"
        style={{
          background: 'rgba(175, 198, 255, 0.08)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-right ambient glow */}
      <div
        className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full"
        style={{
          background: 'rgba(74, 215, 120, 0.06)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  )
}

export default GlassCard
