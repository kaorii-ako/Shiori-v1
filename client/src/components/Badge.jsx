import { motion } from 'framer-motion'
import Icon from './Icon'

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: IconComp,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#2e3148] text-text-primary',
    success: 'bg-[#172502] text-accent-success stroke-success',
    info: 'bg-[#0c4a6e] text-blue-400 stroke-primary',
    warning: 'bg-[#462c02] text-accent-warning stroke-warning',
    danger: 'bg-[#310b0b] text-accent-danger stroke-danger',
    purple: 'bg-[#1c0e35] text-tertiary stroke-tertiary',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }

  return (
    <motion.span
      className={`
        inline-flex items-center font-medium border rounded-full
        ${variantStyles[variant]}
        ${sizes[size]}
        ${className}
      `}
      style={{
        borderColor: variant === 'default' ? 'rgba(66, 71, 84, 0.30)' : undefined,
      }}
      {...props}
    >
      {IconComp && <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ display: 'block' }} />}
      {children}
    </motion.span>
  )
}

export default Badge
