import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  ...props
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw]
              ${sizes[size]}
            `}
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: '#21262d',
                border: '1px solid rgba(66, 71, 84, 0.40)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
              {...props}
            >
              {/* Header */}
              {(title || onClose) && (
                <div
                  className="flex items-center justify-between px-6 pt-6 pb-2"
                >
                  {title && (
                    <h3
                      className="text-lg on-surface-primary"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                    >
                      {title}
                    </h3>
                  )}
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg transition-sa"
                      style={{ color: '#8c90a0' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(175, 180, 255, 0.10)'
                        e.currentTarget.style.color = '#afc6ff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#8c90a0'
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-6 py-4 flex justify-end gap-3"
                  style={{ borderTop: '1px solid rgba(66, 71, 84, 0.20)' }}
                >
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal
