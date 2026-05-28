import { motion, AnimatePresence } from 'framer-motion'

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              rounded-xl px-4 py-3 shadow-lg glass
              toast-${toast.type} text-sm
              flex items-start gap-3
            `}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Icon */}
            <span className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>

            {/* Content */}
            <p className="flex-1">{toast.message}</p>

            {/* Close */}
            <button
              className="flex-shrink-0 p-0.5 rounded"
              style={{ color: 'inherit', opacity: 0.6 }}
              onClick={() => removeToast(toast.id)}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
