import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { useCalendarStore, useEventStore, useAssignmentsStore } from '../stores'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  border: 'rgba(50,55,70,0.4)',
  borderBright: 'rgba(80,90,110,0.5)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
  cyan: '#4daaff',
}

const card = {
  background: 'rgba(13,17,24,0.95)',
  border: '1px solid rgba(50,55,70,0.4)',
  borderRadius: 12,
  padding: '20px 24px',
}

const TYPE_COLORS = {
  exam: '#ff4d6a',
  deadline: '#ff6b9d',
  academic: '#afc6ff',
  study: '#c44dff',
  personal: '#4daaff',
  class: '#4dff91',
  assignment: '#ffd6a0',
}

const Calendar = () => {
  const { events: calEvents, addEvent } = useCalendarStore()
  const { events: demoEvents } = useEventStore()
  const { assignments } = useAssignmentsStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', type: 'personal' })

  const today = new Date()

  const allEvents = useMemo(() => {
    const merged = [...calEvents, ...demoEvents]
    const seen = new Set()
    return merged.filter(e => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    })
  }, [calEvents, demoEvents])

  const assignmentDots = useMemo(() => {
    const map = {}
    assignments.forEach(a => {
      if (!a.dueDate || a.status === 'graded' || a.status === 'completed') return
      const key = new Date(a.dueDate).toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [assignments])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDay = firstDay.getDay()
    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: new Date(year, month, -startingDay + i + 1), currentMonth: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false })
    }
    return days
  }

  const days = getDaysInMonth(currentDate)

  const getItemsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    const evts = allEvents.filter(e => {
      const d = new Date(e.start || e.date)
      return d.toISOString().split('T')[0] === dateStr
    })
    const asgns = (assignmentDots[dateStr] || []).map(a => ({
      id: a.id, title: a.title, type: 'assignment', isAssignment: true,
      courseName: a.courseName, color: TYPE_COLORS.assignment, priority: a.priority
    }))
    return [...evts, ...asgns]
  }

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const selectedItems = selectedDate ? getItemsForDate(selectedDate) : []

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.start) return
    addEvent({
      id: Date.now().toString(),
      title: newEvent.title,
      start: new Date(newEvent.start),
      end: newEvent.end ? new Date(newEvent.end) : null,
      type: newEvent.type,
      source: 'manual'
    })
    setModalOpen(false)
    setNewEvent({ title: '', start: '', end: '', type: 'personal' })
  }

  // Build upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const items = []
    allEvents.forEach(e => {
      const d = new Date(e.start || e.date)
      if (d >= now) items.push({ ...e, _date: d })
    })
    Object.entries(assignmentDots).forEach(([dateStr, asgns]) => {
      const d = new Date(dateStr)
      if (d >= now) {
        asgns.forEach(a => items.push({ ...a, _date: d, type: 'assignment', isAssignment: true }))
      }
    })
    return items.sort((a, b) => a._date - b._date).slice(0, 12)
  }, [allEvents, assignmentDots])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: T.text, letterSpacing: '-0.02em' }}>
            Calendar
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 4 }}>
            Deadlines, exams, and study sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, color: T.text, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Today
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #c44dff, #528dff)', color: '#fff', border: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Add Event
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <div style={card}>
            {/* Month navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: T.text }}>
                {monthYear}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', color: T.faint, padding: '4px 0', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {days.map(({ date, currentMonth }, i) => {
                const isToday = date.toDateString() === today.toDateString()
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                const items = getItemsForDate(date)
                const hasExam = items.some(e => e.type === 'exam')

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.004 }}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minHeight: 60, padding: '6px 4px', borderRadius: 8,
                      background: isSelected
                        ? 'rgba(196,77,255,0.15)'
                        : isToday
                        ? 'rgba(82,141,255,0.10)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(196,77,255,0.5)' : isToday ? 'rgba(82,141,255,0.35)' : 'rgba(50,55,70,0.3)'}`,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: currentMonth ? 1 : 0.3,
                      boxShadow: hasExam ? '0 0 8px rgba(255,77,106,0.25)' : 'none',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: isToday ? 700 : 400,
                      fontSize: 13,
                      color: isToday ? T.blue : isSelected ? T.purple : T.text,
                      marginBottom: 4,
                    }}>
                      {date.getDate()}
                    </span>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {items.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: item.type === 'exam' ? '#ff4d6a' : item.isAssignment ? T.orange : (TYPE_COLORS[item.type] || T.blue),
                          boxShadow: item.type === 'exam' ? '0 0 4px #ff4d6a' : 'none',
                        }} />
                      ))}
                      {items.length > 4 && (
                        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: T.faint }}>
                          +{items.length - 4}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
              {[
                { color: '#ff4d6a', label: 'Exam' },
                { color: T.orange, label: 'Assignment due' },
                { color: T.purpleVibrant, label: 'Study session' },
                { color: T.blue, label: 'Academic' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Selected date details */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: T.text }}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : 'Select a date'}
                </h2>
                <CalendarIcon size={14} style={{ color: T.faint }} />
              </div>

              {selectedItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedItems.map(item => {
                    const color = item.type === 'exam' ? '#ff4d6a' : item.isAssignment ? T.orange : (TYPE_COLORS[item.type] || T.blue)
                    return (
                      <div key={item.id} style={{ padding: '10px 12px', borderRadius: 8, background: `${color}0d`, border: `1px solid ${color}30` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {item.isAssignment
                            ? <ClipboardList size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
                            : item.type === 'exam'
                            ? <AlertTriangle size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
                            : <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                          }
                          <div>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 13, color: T.text, lineHeight: 1.3 }}>
                              {item.title}
                            </p>
                            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>
                              {item.isAssignment ? `${item.courseName} — due` : item.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <CalendarIcon size={24} style={{ color: T.faint, margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint }}>
                    {selectedDate ? 'Nothing scheduled' : 'Click a date'}
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming events */}
            <div style={card}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 14 }}>
                Upcoming
              </h2>
              {upcomingEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {upcomingEvents.map((item, idx) => {
                    const color = item.type === 'exam' ? '#ff4d6a' : item.isAssignment ? T.orange : (TYPE_COLORS[item.type] || T.blue)
                    const dateStr = item._date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: idx < upcomingEvents.length - 1 ? `1px solid ${T.border}` : 'none' }}
                      >
                        <div style={{ width: 3, height: 32, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 12, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </p>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted, marginTop: 1 }}>
                            {item.type === 'exam' ? '⚠ Exam' : item.isAssignment ? 'Due' : item.type} · {dateStr}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint, textAlign: 'center', padding: '20px 0' }}>
                  No upcoming events
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Event"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
            placeholder="Study session, Assignment due..."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Start"
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent(p => ({ ...p, start: e.target.value }))}
            />
            <Input
              label="End (optional)"
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent(p => ({ ...p, end: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', color: T.muted, marginBottom: 8, textTransform: 'uppercase' }}>
              Type
            </label>
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent(p => ({ ...p, type: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.text, outline: 'none', fontFamily: "'Manrope', sans-serif", fontSize: 14 }}
            >
              <option value="personal">Personal</option>
              <option value="study">Study Session</option>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="academic">Academic</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Calendar
