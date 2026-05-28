import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      addEvent({ title: formData.title, date: formData.date })
      setFormData({ title: '', date: '' })
      setShowForm(false)
    }
  }

  const onSurfaceSecondary = '#8c90a0'
  const onSurfaceTertiary = '#606080'
  const surfaceContainer = '#181c22'

  return (
    <div
      className="rounded-xl"
      style={{
        background: 'rgba(24, 28, 34, 0.60)',
        border: '1px solid rgba(66, 71, 84, 0.25)',
        fontFamily: "'Manrope', sans-serif"
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(66,71,84,0.20)' }}>
        <h3
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.7rem', color: '#d7ffc5', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          EVENTS
        </h3>
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={() => setShowForm(!showForm)}
          style={{ borderColor: 'rgba(215,255,197,0.25)', color: '#d7ffc5' }}
        >
          ADD
        </Button>
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-b" style={{ borderColor: 'rgba(66,71,84,0.20)', background: 'rgba(215,255,197,0.03)' }}>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Event title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-sa w-full"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-sa w-full"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">
                    ADD EVENT
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                    style={{ borderColor: 'rgba(175,198,255,0.20)', color: '#8c90a0' }}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div className="p-4">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-2">
            {upcomingEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(66,71,84,0.20)' }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{
                  background: event.daysUntil === 0 ? '#ffb4ab' : event.daysUntil <= 7 ? '#ffb44d' : '#528dff',
                  boxShadow: event.daysUntil === 0 ? '0 0 8px #ffb4ab' : event.daysUntil <= 7 ? '0 0 8px #ffb44d' : '0 0 8px #528dff'
                }} />
                <div className="flex-1 pl-3">
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#dfe2eb' }}>
                    {event.title}
                  </p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', color: onSurfaceSecondary }}>
                    {event.daysUntil === 0 ? 'TODAY!' : `${event.daysUntil} DAYS`}
                  </p>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  style={{ color: '#ffb4ab', opacity: 0.6 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#e5b5ff', opacity: 0.4 }} />
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem', color: onSurfaceTertiary }}>
              No upcoming events. Add one!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventTracker
