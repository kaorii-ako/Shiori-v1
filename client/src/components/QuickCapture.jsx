import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Clock, BookOpen, AlertCircle } from 'lucide-react'
import { useAssignmentsStore } from '../stores'

const PRIORITY_COLORS = {
  high: '#ff4d6a',
  medium: '#ffd6a0',
  low: '#4dff91',
}

const QuickCapture = () => {
  const { addAssignment, courses } = useAssignmentsStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  // Ctrl+Shift+A global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSubmit = () => {
    if (!title.trim()) return
    const course = courses.find(c => c.id === courseId)
    addAssignment({
      id: `assign-${Date.now()}`,
      title: title.trim(),
      courseId: courseId || null,
      courseName: course?.name || null,
      dueDate: dueDate || null,
      status: 'pending',
      priority,
      description: '',
      estimatedHours: 1,
      grade: null,
    })
    setSaved(true)
    setTimeout(() => {
      setTitle('')
      setCourseId('')
      setDueDate('')
      setPriority('medium')
      setSaved(false)
      setOpen(false)
    }, 800)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 120,
          width: 52, height: 52, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #ff4d6a, #c44dff)'
            : 'linear-gradient(135deg, #c44dff, #528dff)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(196,77,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Quick capture (Ctrl+Shift+A)"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={22} color="#fff" />
        </motion.div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            style={{
              position: 'fixed', bottom: 86, right: 24, zIndex: 120,
              width: 'min(360px, calc(100vw - 32px))',
              background: 'rgba(16,20,26,0.97)',
              border: '1px solid rgba(196,77,255,0.35)',
              borderRadius: 16, padding: '20px 20px 16px',
              boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 32px rgba(196,77,255,0.12)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#c44dff' }}>
                QUICK CAPTURE
              </span>
              <span style={{ fontFamily: 'VT323', fontSize: 12, color: '#424754' }}>Ctrl+Shift+A</span>
            </div>

            {/* Assignment title */}
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Assignment name..."
              style={{
                width: '100%', padding: '10px 12px', marginBottom: 10,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                color: '#dfe2eb', fontFamily: 'Manrope, sans-serif', fontSize: 15,
                outline: 'none', boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {/* Course */}
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: courseId ? '#dfe2eb' : '#606080', fontFamily: 'VT323', fontSize: 15, cursor: 'pointer' }}
              >
                <option value="">Course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Due date */}
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: dueDate ? '#dfe2eb' : '#606080', fontFamily: 'VT323', fontSize: 15, cursor: 'pointer' }}
              />
            </div>

            {/* Priority */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['high', 'medium', 'low'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1, padding: '6px', borderRadius: 6, cursor: 'pointer',
                    background: priority === p ? `${PRIORITY_COLORS[p]}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.08)'}`,
                    color: priority === p ? PRIORITY_COLORS[p] : '#606080',
                    fontFamily: '"Press Start 2P"', fontSize: 7, transition: 'all 0.15s',
                  }}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: saved
                  ? 'linear-gradient(135deg, #4dff91, #4daaff)'
                  : title.trim()
                  ? 'linear-gradient(135deg, #c44dff, #528dff)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                color: title.trim() ? '#fff' : '#424754',
                fontFamily: '"Press Start 2P"', fontSize: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {saved
                ? <><Check size={14} /> SAVED!</>
                : <><Plus size={14} /> ADD ASSIGNMENT</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default QuickCapture
