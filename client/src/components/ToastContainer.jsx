import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore } from '../stores'

const Toast = ({ toast }) => {
  const { removeToast } = useUIStore()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-accent-success" />,
    error: <AlertCircle className="w-5 h-5 text-accent-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-accent-warning" />,
    info: <Info className="w-5 h-5 text-accent-secondary" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className="glass rounded-xl p-4 flex items-start gap-3 min-w-[300px] max-w-md shadow-xl"
    >
      {icons[toast.type || 'info']}
      <div className="flex-1">
        {toast.title && (
          <p className="font-medium text-sm">{toast.title}</p>
        )}
        <p className="text-text-secondary text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

const ToastContainer = () => {
  const { toasts } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
