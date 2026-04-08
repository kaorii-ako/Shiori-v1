import { motion } from 'framer-motion'

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-md mb-4">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Get Started'}
        </button>
      )}
    </motion.div>
  )
}

export default EmptyState
