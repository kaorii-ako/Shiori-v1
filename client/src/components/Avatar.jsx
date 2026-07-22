const Avatar = ({
  src,
  name = '',
  size = 'md',
  status,
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  }

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-lg object-cover`}
        />
      ) : (
        <div className={`
          ${sizes[size]} rounded-lg
          flex items-center justify-center font-semibold
          on-surface-primary
        `}
        style={{
          background: '#528dff',
          color: '#0b0e14',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span className={`
          absolute bottom-0 right-0 ${statusSizes[size]}
          rounded-full border-2 border-surface-container-low
          dot-${status}
        `} />
      )}
    </div>
  )
}

export default Avatar
