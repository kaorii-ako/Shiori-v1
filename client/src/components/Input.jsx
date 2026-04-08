import { forwardRef } from 'react'
import Icon from './Icon'

const Input = forwardRef(({
  label,
  error,
  icon: IconComponent,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-sm mb-2"
          style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#a0a0b5' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {IconComponent && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#606080', zIndex: 1 }}
          >
            <Icon icon={IconComponent} size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            input-glass w-full
            ${IconComponent ? 'pl-10' : ''}
            ${error ? 'border-accent-danger' : ''}
            ${className}
          `}
          style={{
            fontFamily: 'VT323',
            fontSize: '18px',
            position: 'relative',
            zIndex: 0
          }}
          {...props}
        />
      </div>
      {error && (
        <p
          className="mt-2"
          style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff4d6a' }}
        >
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
