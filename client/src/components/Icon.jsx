import { forwardRef } from 'react'

const Icon = forwardRef(({ icon: IconComponent, className = '', size = 20, strokeWidth = 2, ...props }, ref) => {
  if (!IconComponent) return null

  return (
    <span
      ref={ref}
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        style={{ display: 'block' }}
      />
    </span>
  )
})

Icon.displayName = 'Icon'

export default Icon
