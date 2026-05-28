import { forwardRef } from 'react'
import Icon from './Icon'

const Input = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: IconComp,
  disabled,
  className = '',
  autoComplete,
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs label-strong on-surface-tertiary"
          style={{ paddingLeft: IconComp ? '0.5rem' : '0' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {IconComp && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#606080' }}>
            <IconComp className="w-5 h-5" style={{ display: 'block' }} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            input-sa w-full box-border
            ${IconComp ? 'pl-10' : 'pl-3'}
            ${error ? 'border-b-2 border-b-danger' : ''}
          `}
          style={{
            borderRadius: '4px',
            minHeight: 44,
            background: '#14181e',
          }}
          {...props}
        />
      </div>
      {error && (
        <p
          className="text-xs"
          style={{ color: '#ffb4ab', fontWeight: 500, fontFamily: "'Manrope', sans-serif", paddingLeft: IconComp ? '0.5rem' : '0' }}
        >
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
