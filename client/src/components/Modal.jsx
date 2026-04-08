import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #12121f 100%)',
              border: '4px solid #c44dff',
              boxShadow: '8px 8px 0 0 #0a0a14, 8px 8px 0 4px #c44dff, 0 0 60px rgba(196,77,255,0.3)'
            }}
          >
            <div
              className="flex items-center justify-between p-4"
              style={{
                borderBottom: '3px solid rgba(196,77,255,0.5)',
                background: 'linear-gradient(90deg, rgba(255,107,157,0.1) 0%, transparent 50%)'
              }}
            >
              <h2
                className="gradient-text"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 transition-all hover:scale-110"
                style={{
                  background: 'rgba(255,77,106,0.2)',
                  border: '2px solid #ff4d6a'
                }}
              >
                <X className="w-5 h-5" style={{ color: '#ff4d6a' }} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              {children}
            </div>
            {footer && (
              <div
                className="p-4 flex justify-end gap-3"
                style={{ borderTop: '2px solid rgba(196,77,255,0.3)' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
