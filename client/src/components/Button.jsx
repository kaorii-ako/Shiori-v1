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

  // Variant classes mapped via inline styles for gradient CTAs
  const variantStyles = {
    primary: {
      bg: 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)',
      color: '#10141a',
      hover: 'rgba(82,141,255,0.30)',
    },
    secondary: {
      bg: 'linear-gradient(45deg, #d7ffc5 0%, #4a6c3a 100%)',
      color: '#10141a',
      hover: 'rgba(74,215,120,0.25)',
    },
    tertiary: {
      bg: 'linear-gradient(45deg, #e5b5ff 0%, #8b63a5 100%)',
      color: '#10141a',
      hover: 'rgba(229,181,255,0.25)',
    },
    ghost: {
      bg: 'transparent',
      color: '#afc6ff',
      border: '1px solid rgba(175, 198, 255, 0.25)',
      hover: 'rgba(175, 198, 255, 0.10)',
    },
    danger: {
      bg: 'linear-gradient(45deg, #ffb4ab 0%, #ff6b7a 100%)',
      color: '#10141a',
      hover: 'rgba(255,107,122,0.25)',
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
        boxShadow: variant !== 'ghost'
          ? '0 4px 16px rgba(82, 141, 255, 0.15)'
          : 'none',
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
