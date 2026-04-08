const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: {
      bg: 'rgba(255,255,255,0.1)',
      color: '#a0a0b5',
      border: 'rgba(255,255,255,0.2)'
    },
    success: {
      bg: 'rgba(77,255,145,0.2)',
      color: '#4dff91',
      border: '#4dff91'
    },
    warning: {
      bg: 'rgba(255,170,77,0.2)',
      color: '#ffaa4d',
      border: '#ffaa4d'
    },
    danger: {
      bg: 'rgba(255,77,106,0.2)',
      color: '#ff4d6a',
      border: '#ff4d6a'
    },
    info: {
      bg: 'rgba(77,159,255,0.2)',
      color: '#4d9fff',
      border: '#4d9fff'
    },
    primary: {
      bg: 'rgba(196,77,255,0.2)',
      color: '#c44dff',
      border: '#c44dff'
    }
  }

  const sizes = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-2'
  }

  const style = variants[variant]

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase ${className}
        ${sizes[size]}
      `}
      style={{
        background: style.bg,
        color: style.color,
        border: `2px solid ${style.border}`,
        fontFamily: '"Press Start 2P"',
        fontSize: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px',
        boxShadow: `2px 2px 0 ${style.border}`,
        imageRendering: 'pixelated'
      }}
    >
      {children}
    </span>
  )
}

export default Badge
