import { motion } from 'framer-motion'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) => {
  const sizes = {
    sm: 'text-xs py-1.5 px-3 rounded',
    md: 'text-sm py-2 px-4 rounded',
    lg: 'text-base py-2.5 px-6 rounded',
  }

  // Flat, solid fills — no gradient CTAs.
  const variantStyles = {
    primary: {
      bg: '#528dff',
      color: '#0b0e14',
    },
    secondary: {
      bg: '#4dff91',
      color: '#0b0e14',
    },
    tertiary: {
      bg: '#c44dff',
      color: '#10141a',
    },
    ghost: {
      bg: 'transparent',
      color: '#afc6ff',
      border: '1px solid rgba(175, 198, 255, 0.25)',
    },
    danger: {
      bg: '#ff6b7a',
      color: '#10141a',
    },
  }

  const style = variant === 'ghost'
    ? {
        background: variantStyles.ghost.bg,
        color: variantStyles.ghost.color,
        border: variantStyles.ghost.border,
        padding: '0.625rem 1.25rem',
      }
    : {
        background: variantStyles[variant].bg,
        color: variantStyles[variant].color,
        padding: '0.625rem 1.25rem',
      }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 font-medium
        focus-ring transition-sa whitespace-nowrap
        ${sizes[size]}
        ${className}
      `}
      style={{
        ...style,
        borderRadius: '6px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.04em',
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem',
      }}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      )}
      {Icon && !loading && (
        <Icon
          className="flex-shrink-0"
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          style={{ display: 'block' }}
        />
      )}
      {children}
    </motion.button>
  )
}

export default Button
