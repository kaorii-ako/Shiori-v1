import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Trash2, Plus } from 'lucide-react'
import { useEventStore } from '../stores'
import Button from './Button'

const EventTracker = () => {
  const { events, addEvent, deleteEvent, getUpcomingEvents } = useEventStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', date: '' })

  const upcomingEvents = getUpcomingEvents()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.date) {
      addEvent({
        title: formData.title,
        date: formData.date
      })
      setFormData({ title: '', date: '' })
      setShowForm(false)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(18,18,31,0.98) 100%)',
        border: '3px solid rgba(196,77,255,0.4)',
        boxShadow: '0 0 20px rgba(196,77,255,0.2)'
      }}
    >
      {/* Header */}
      <div
        className="p-6 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(196,77,255,0.2)' }}
      >
        <h3
          className="text-accent-purple"
          style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
        >
          EVENTS
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={() => setShowForm(!showForm)}
          style={{
            borderColor: '#ff6b9d',
            color: '#ff6b9d',
            padding: '6px 12px'
          }}
        >
          ADD
        </Button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border-b"
          style={{ borderColor: 'rgba(196,77,255,0.2)', background: 'rgba(255,107,157,0.05)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Event title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-glass w-full"
              style={{ fontFamily: 'VT323', fontSize: '16px' }}
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-glass w-full"
              style={{ fontFamily: 'VT323', fontSize: '16px' }}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1"
              >
                ADD EVENT
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                CANCEL
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Events List */}
      <div className="p-6">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid rgba(77,159,255,0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Days indicator bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background:
                      event.daysUntil === 0
                        ? '#ff4d6a'
                        : event.daysUntil <= 7
                          ? '#ffaa4d'
                          : '#4d9fff',
                    boxShadow:
                      event.daysUntil === 0
                        ? '0 0 10px #ff4d6a'
                        : event.daysUntil <= 7
                          ? '0 0 10px #ffaa4d'
                          : '0 0 10px #4d9fff'
                  }}
                />

                <div className="flex-1 pl-4">
                  <p
                    className="font-bold"
                    style={{ fontFamily: 'VT323', fontSize: '18px' }}
                  >
                    {event.title}
                  </p>
                  <p
                    className="text-text-secondary"
                    style={{ fontFamily: 'VT323', fontSize: '14px' }}
                  >
                    {event.daysUntil === 0 ? 'TODAY!' : `${event.daysUntil} DAYS`}
                  </p>
                </div>

                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 hover:opacity-80 transition"
                  style={{ color: '#ff4d6a' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: '#c44dff', opacity: 0.5 }}
            />
            <p
              style={{
                fontFamily: 'VT323',
                fontSize: '16px',
                color: '#606080'
              }}
            >
              No upcoming events. Add one!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventTracker
