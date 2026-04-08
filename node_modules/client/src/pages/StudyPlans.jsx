import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Calendar,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { useAssignmentsStore } from '../stores'
import { ai } from '../lib/api'

const StudyPlans = () => {
  const { assignments, courses } = useAssignmentsStore()
  const [studyPlan, setStudyPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])

  const generateStudyPlan = async () => {
    setLoading(true)
    try {
      const response = await ai.generateStudyPlan(assignments, {
        daysPerWeek: 5,
        hoursPerDay: 3
      })
      setStudyPlan(response.data.plan)
      setSessions(response.data.sessions || generateMockSessions())
    } catch (error) {
      console.error('Failed to generate study plan:', error)
      setSessions(generateMockSessions())
    } finally {
      setLoading(false)
    }
  }

  const generateMockSessions = () => {
    const today = new Date()
    const mock = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const numSessions = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numSessions; j++) {
        mock.push({
          id: `${i}-${j}`,
          title: ['Math Review', 'Biology Study', 'Physics Practice', 'Chemistry Lab Prep', 'English Essay'][Math.floor(Math.random() * 5)],
          date: date,
          duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
          completed: false,
          aiGenerated: true
        })
      }
    }

    return mock
  }

  const toggleSession = (sessionId) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, completed: !s.completed } : s
      )
    )
  }

  const groupSessionsByDate = () => {
    const grouped = {}
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(session)
    })
    return grouped
  }

  const groupedSessions = groupSessionsByDate()
  const completedCount = sessions.filter(s => s.completed).length
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold">Study Plans</h1>
          <p className="text-text-secondary mt-1">AI-powered study schedules</p>
        </div>
        <Button
          icon={Sparkles}
          onClick={generateStudyPlan}
          loading={loading}
        >
          Generate Plan
        </Button>
      </motion.div>

      {sessions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-primary/20">
                  <BookOpen className="w-6 h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold font-mono">{sessions.length}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-success/20">
                  <CheckCircle className="w-6 h-6 text-accent-success" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Completed</p>
                  <p className="text-2xl font-bold font-mono">{completedCount}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-secondary/20">
                  <Clock className="w-6 h-6 text-accent-secondary" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Total Study Time</p>
                  <p className="text-2xl font-bold font-mono">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg">Weekly Schedule</h2>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Sparkles className="w-4 h-4 text-accent-tertiary" />
                <span>AI-generated plan</span>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([dateKey, daySessions]) => {
                const date = new Date(dateKey)
                const isToday = date.toDateString() === new Date().toDateString()
                const dayCompleted = daySessions.filter(s => s.completed).length

                return (
                  <div key={dateKey}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`
                        w-12 h-12 rounded-xl flex flex-col items-center justify-center
                        ${isToday ? 'bg-accent-primary/20 ring-1 ring-accent-primary' : 'bg-white/5'}
                      `}>
                        <span className="text-xs text-text-muted uppercase">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-lg font-bold ${isToday ? 'text-accent-primary' : ''}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-text-muted">
                          {dayCompleted}/{daySessions.length} sessions completed
                        </p>
                      </div>
                      {isToday && <Badge variant="primary">Today</Badge>}
                    </div>

                    <div className="ml-4 pl-4 border-l-2 border-glass-border space-y-2">
                      {daySessions.map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
                            ${session.completed
                              ? 'bg-accent-success/10 opacity-60'
                              : 'bg-white/5 hover:bg-white/10'
                            }
                          `}
                          onClick={() => toggleSession(session.id)}
                        >
                          {session.completed ? (
                            <CheckCircle className="w-5 h-5 text-accent-success flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${session.completed ? 'line-through' : ''}`}>
                              {session.title}
                            </p>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration} minutes
                            </p>
                          </div>
                          {session.aiGenerated && (
                            <Badge variant="info" size="sm">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </>
      ) : (
        <GlassCard className="text-center py-16">
          <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">No Study Plan Yet</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">
            Generate an AI-powered study plan based on your upcoming assignments and deadlines.
            Shiori will create a personalized weekly schedule to help you stay on track.
          </p>
          <Button icon={Sparkles} onClick={generateStudyPlan} loading={loading}>
            Generate Study Plan
          </Button>
        </GlassCard>
      )}
    </div>
  )
}

export default StudyPlans
