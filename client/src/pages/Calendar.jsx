import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
            background: 'linear-gradient(135deg, #afc6ff, #e5b5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CALENDAR
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
            Deadlines, exams, and study sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => setCurrentDate(new Date())} size="sm">TODAY</Button>
          <Button icon={Plus} onClick={() => setModalOpen(true)} size="sm">ADD EVENT</Button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, cursor: 'pointer', color: '#dfe2eb' }}>
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#dfe2eb' }}>{monthYear.toUpperCase()}</h2>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, cursor: 'pointer', color: '#dfe2eb' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontFamily: '"Press Start 2P"', fontSize: 7,
                  color: '#424754', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {days.map(({ date, currentMonth }, i) => {
                const isToday = date.toDateString() === today.toDateString()
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                const items = getItemsForDate(date)
                const hasExam = items.some(e => e.type === 'exam')
                const hasDeadline = items.some(e => e.isAssignment)

                return (
                  <motion.button key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minHeight: 64, padding: '6px 4px', borderRadius: 6,
                      background: isSelected ? 'rgba(196,77,255,0.15)' : isToday ? 'rgba(82,141,255,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(196,77,255,0.5)' : isToday ? 'rgba(82,141,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: currentMonth ? 1 : 0.35,
                      boxShadow: hasExam ? '0 0 8px rgba(255,77,106,0.3)' : 'none',
                    }}>
                    <span style={{ fontFamily: isToday ? '"Press Start 2P"' : 'VT323',
                      fontSize: isToday ? 10 : 18,
                      color: isToday ? '#afc6ff' : isSelected ? '#e5b5ff' : '#dfe2eb',
                      marginBottom: 4 }}>
                      {date.getDate()}
                    </span>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {items.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: item.type === 'exam' ? '#ff4d6a' : item.isAssignment ? '#ffd6a0' : (TYPE_COLORS[item.type] || '#afc6ff'),
                          boxShadow: item.type === 'exam' ? '0 0 4px #ff4d6a' : 'none',
                        }} />
                      ))}
                      {items.length > 4 && (
                        <span style={{ fontFamily: 'VT323', fontSize: 10, color: '#606080' }}>+{items.length - 4}</span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
              {[
                { color: '#ff4d6a', label: 'Exam' },
                { color: '#ffd6a0', label: 'Assignment due' },
                { color: '#c44dff', label: 'Study session' },
                { color: '#afc6ff', label: 'Academic' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Side panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#dfe2eb' }}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
                  : 'SELECT DATE'}
              </h2>
              <CalendarIcon size={14} style={{ color: '#424754' }} />
            </div>

            {selectedItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedItems.map(item => {
                  const color = item.type === 'exam' ? '#ff4d6a' : item.isAssignment ? '#ffd6a0' : (TYPE_COLORS[item.type] || '#afc6ff')
                  return (
                    <div key={item.id} style={{ padding: '10px 12px', borderRadius: 6,
                      background: `${color}0f`, border: `1px solid ${color}33` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        {item.isAssignment
                          ? <ClipboardList size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
                          : item.type === 'exam'
                          ? <AlertTriangle size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
                          : <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                        }
                        <div>
                          <p style={{ fontFamily: 'VT323', fontSize: 17, color: '#dfe2eb', lineHeight: 1.2 }}>{item.title}</p>
                          <p style={{ fontFamily: 'VT323', fontSize: 13, color: '#606080', marginTop: 2 }}>
                            {item.isAssignment ? `${item.courseName} — due` : item.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#606080' }}>
                <CalendarIcon size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ fontFamily: 'VT323', fontSize: 16 }}>
                  {selectedDate ? 'Nothing scheduled' : 'Click a date'}
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Event" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Event Title" value={newEvent.title}
            onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
            placeholder="Study session, Assignment due..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Start" type="datetime-local" value={newEvent.start}
              onChange={(e) => setNewEvent(p => ({ ...p, start: e.target.value }))} />
            <Input label="End (optional)" type="datetime-local" value={newEvent.end}
              onChange={(e) => setNewEvent(p => ({ ...p, end: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: '"Press Start 2P"', fontSize: 8, color: '#8c90a0', marginBottom: 8 }}>
              TYPE
            </label>
            <select value={newEvent.type} onChange={(e) => setNewEvent(p => ({ ...p, type: e.target.value }))}
              className="input-glass w-full">
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
