import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Icon from './Icon'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: IconComponent,
  className = '',
  ...props
}) => {
  const variants = {
    primary: {
      class: 'text-white',
      style: {
        background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
        boxShadow: 'inset -2px -2px 0 #993d6b, inset 2px 2px 0 #ff9dc4, 0 4px 0 #1a1a2e',
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        borderRadius: '0',
        textTransform: 'uppercase'
      }
    },
    secondary: {
      class: 'text-text-primary',
      style: {
        background: 'transparent',
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        borderRadius: '0',
        border: '2px solid #c44dff',
        textTransform: 'uppercase'
      }
    },
    ghost: {
      class: 'text-text-primary',
      style: {
        background: 'transparent',
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        borderRadius: '0',
        border: 'none',
        textTransform: 'uppercase'
      }
    },
    danger: {
      class: 'text-white',
      style: {
        background: 'linear-gradient(135deg, #ff4d6a 0%, #ff6b6b 100%)',
        boxShadow: 'inset -2px -2px 0 #aa2242, inset 2px 2px 0 #ff8899, 0 4px 0 #1a1a2e',
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        borderRadius: '0',
        textTransform: 'uppercase'
      }
    }
  }

  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4'
  }

  const variantConfig = variants[variant]

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { y: -2 }}
      whileTap={disabled || loading ? {} : { y: 2 }}
      className={`
        font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap
        transition-all duration-100
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${sizes[size]} ${variantConfig.class} ${className}
      `}
      style={variantConfig.style}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon icon={Loader2} size={16} className="animate-spin" />
      ) : IconComponent ? (
        <Icon icon={IconComponent} size={16} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  )
}

export default Button
