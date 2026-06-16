import { motion } from 'motion/react'

// Scroll-triggered reveal. Wraps any content; animates in once when it enters view.
export default function Reveal({ children, delay = 0, y = 24, style, className }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
