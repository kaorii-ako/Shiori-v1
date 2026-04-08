import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { useCalendarStore } from '../stores'

const Calendar = () => {
  const { events, addEvent } = useCalendarStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', type: 'personal' })

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1)
      days.push({ date: prevDate, currentMonth: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false })
    }

    return days
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      const eventDate = new Date(e.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

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

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const typeColors = {
    class: 'bg-accent-primary',
    personal: 'bg-accent-secondary',
    study: 'bg-accent-tertiary'
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold">Calendar</h1>
          <p className="text-text-secondary mt-1">Manage your schedule and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={goToToday}>Today</Button>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Event</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-heading font-semibold text-lg">{monthYear}</h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-text-muted text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map(({ date, currentMonth }, index) => {
                const isToday = date.toDateString() === today.toDateString()
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                const dateEvents = getEventsForDate(date)

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-2 rounded-xl text-sm transition-all min-h-[70px] relative
                      ${currentMonth ? 'text-text-primary' : 'text-text-muted'}
                      ${isToday ? 'bg-accent-primary/20 ring-1 ring-accent-primary' : ''}
                      ${isSelected ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}
                    `}
                  >
                    <span className={`font-medium ${isToday ? 'text-accent-primary' : ''}`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dateEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`${typeColors[event.type] || typeColors.class} h-1.5 rounded-full`}
                        />
                      ))}
                      {dateEvents.length > 3 && (
                        <p className="text-xs text-text-muted">+{dateEvents.length - 3} more</p>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold">
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  : 'Select a Date'}
              </h2>
              <CalendarIcon className="w-5 h-5 text-text-muted" />
            </div>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[event.type]}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.start).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                          {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary text-sm">No events</p>
                <p className="text-text-muted text-xs mt-1">Click a date to see events</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-glass-border">
              <p className="text-xs text-text-muted mb-2">Event Types</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-primary" />
                  <span className="text-xs">Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-secondary" />
                  <span className="text-xs">Personal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-tertiary" />
                  <span className="text-xs">Study Session</span>
                </div>
              </div>
            </div>
          </GlassCard>
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
        <div className="space-y-4">
          <Input
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Study session, Assignment due..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Event Type</label>
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
              className="input-glass w-full"
            >
              <option value="personal">Personal</option>
              <option value="study">Study Session</option>
              <option value="class">Class</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Calendar
