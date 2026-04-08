import { motion } from 'framer-motion'
import {
  Calendar,
  ClipboardList,
  Mail,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Plus,
  Play,
  Star,
  Zap
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ClockComponent from '../components/Clock'
import TimeTrackerBars from '../components/TimeTrackerBars'
import EventTracker from '../components/EventTracker'
import { Link, useNavigate } from 'react-router-dom'
import { useAssignmentsStore, useUIStore } from '../stores'

const Home = () => {
  const { assignments } = useAssignmentsStore()
  const { setActiveModal } = useUIStore()
  const navigate = useNavigate()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const handleAdd = () => {
    setActiveModal('assignment')
    navigate('/assignments')
  }

  const handleStudy = () => {
    navigate('/study')
  }

  const handleSync = () => {
    window.location.reload()
  }

  const todaysAssignments = assignments.filter(a => {
    if (!a.dueDate) return false
    const due = new Date(a.dueDate).toISOString().split('T')[0]
    return due === todayStr
  })

  const upcomingAssignments = assignments.filter(a => {
    if (!a.dueDate || a.status === 'graded') return false
    const due = new Date(a.dueDate)
    return due >= today && due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  })

  const stats = [
    {
      icon: ClipboardList,
      label: 'DUE TODAY',
      value: todaysAssignments.length,
      color: 'from-accent-warning to-orange-400',
      bg: 'rgba(255,170,77,0.2)'
    },
    {
      icon: Calendar,
      label: 'THIS WEEK',
      value: upcomingAssignments.length,
      color: 'from-accent-pink to-accent-purple',
      bg: 'rgba(196,77,255,0.2)'
    },
    {
      icon: Mail,
      label: 'UNREAD',
      value: 3,
      color: 'from-accent-blue to-cyan-400',
      bg: 'rgba(77,159,255,0.2)'
    },
    {
      icon: TrendingUp,
      label: 'AVG GRADE',
      value: '87%',
      color: 'from-accent-success to-emerald-400',
      bg: 'rgba(77,255,145,0.2)'
    }
  ]

  const quickActions = [
    { icon: Plus, label: 'ADD', color: '#ff6b9d' },
    { icon: Play, label: 'STUDY', color: '#4dff91' },
    { icon: RefreshCw, label: 'SYNC', color: '#4d9fff' }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-2xl gradient-text mb-2"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '16px' }}
          >
            WELCOME BACK
          </h1>
          <p
            className="text-text-secondary"
            style={{ fontFamily: 'VT323', fontSize: '20px' }}
          >
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              icon={action.icon}
              onClick={
                action.label === 'ADD' ? handleAdd :
                action.label === 'STUDY' ? handleStudy :
                handleSync
              }
              style={{ borderColor: action.color, color: action.color }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-10"
                style={{
                  background: `radial-gradient(circle, ${stat.color.includes('accent-warning') ? '#ffaa4d' : stat.color.includes('accent-pink') ? '#ff6b9d' : stat.color.includes('accent-blue') ? '#4d9fff' : '#4dff91'} 0%, transparent 70%)`
                }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-text-secondary mb-2"
                    style={{ fontFamily: '"Press Start 2P"', fontSize: '8px' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-4xl font-bold font-mono"
                    style={{
                      fontFamily: '"Press Start 2P"',
                      fontSize: '20px',
                      background: `linear-gradient(135deg, ${stat.color.includes('accent-warning') ? '#ffaa4d' : stat.color.includes('accent-pink') ? '#ff6b9d' : stat.color.includes('accent-blue') ? '#4d9fff' : '#4dff91'} 0%, #fff 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="p-3"
                  style={{
                    background: stat.bg,
                    border: '2px solid currentColor',
                    boxShadow: '2px 2px 0 currentColor'
                  }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: 'inherit' }} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Clock, Time Trackers, and Event Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ClockComponent />
        </motion.div>

        {/* Time Trackers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <TimeTrackerBars />
        </motion.div>
      </div>

      {/* Event Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <EventTracker />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="font-bold"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
              >
                UPCOMING TASKS
              </h2>
              <Link
                to="/assignments"
                className="flex items-center gap-2 text-accent-pink hover:underline"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
              >
                VIEW ALL <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingAssignments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAssignments.slice(0, 5).map((assignment, idx) => {
                  const isUrgent = new Date(assignment.dueDate) <= new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isUrgent ? 'rgba(255,77,106,0.5)' : 'rgba(196,77,255,0.3)'}`,
                        boxShadow: isUrgent ? '2px 2px 0 rgba(255,77,106,0.3)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-1 h-12"
                          style={{
                            background: isUrgent ? '#ff4d6a' : '#c44dff',
                            boxShadow: `0 0 10px ${isUrgent ? '#ff4d6a' : '#c44dff'}`
                          }}
                        />
                        <div>
                          <p
                            className="font-bold"
                            style={{ fontFamily: 'VT323', fontSize: '20px' }}
                          >
                            {assignment.title}
                          </p>
                          <p
                            className="text-text-muted"
                            style={{ fontFamily: 'VT323', fontSize: '16px' }}
                          >
                            {assignment.courseName}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isUrgent ? 'danger' : 'warning'}>
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div
                  className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: 'rgba(77,255,145,0.1)',
                    border: '3px solid #4dff91',
                    boxShadow: '4px 4px 0 #4dff91'
                  }}
                >
                  <Star className="w-10 h-10" style={{ color: '#4dff91' }} />
                </div>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }} className="text-accent-success mb-2">
                  ALL CLEAR!
                </p>
                <p className="text-text-secondary" style={{ fontFamily: 'VT323', fontSize: '18px' }}>
                  No upcoming deadlines. You're all caught up!
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" style={{ color: '#ff6b9d' }} />
              <h2
                className="font-bold gradient-text"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
              >
                AI INSIGHT
              </h2>
            </div>
            <div
              className="p-4 mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(196,77,255,0.1) 100%)',
                border: '2px solid rgba(196,77,255,0.3)'
              }}
            >
              <p style={{ fontFamily: 'VT323', fontSize: '18px' }}>
                {upcomingAssignments.length > 0 ? (
                  <>
                    You have{' '}
                    <span className="text-accent-pink font-bold">
                      {upcomingAssignments.length} tasks
                    </span>{' '}
                    due this week. Based on your workload, start with the{' '}
                    <span className="text-accent-blue font-bold">Chemistry review</span>{' '}
                    — it's worth 15% of your grade!
                  </>
                ) : (
                  <>
                    <span className="text-accent-success font-bold">Great job!</span>{' '}
                    No tasks due this week. Perfect time to get ahead!
                  </>
                )}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-full" style={{ color: '#ff6b9d' }}>
              <Zap className="w-4 h-4 mr-2" />
              GENERATE STUDY PLAN
            </Button>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard>
          <h2
            className="font-bold mb-4"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
          >
            RECENT ACTIVITY
          </h2>
          <div className="space-y-3">
            {[
              { text: 'Grade posted: Math Homework #5', subtext: '98/100 - Great work!', time: '2h ago', color: '#4dff91' },
              { text: 'New assignment: Physics Lab Report', subtext: 'Due March 5', time: '5h ago', color: '#c44dff' },
              { text: 'Email from Dr. Smith', subtext: 'Reminder about office hours', time: 'Yesterday', color: '#4d9fff' }
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div
                  className="w-2 h-2 mt-2"
                  style={{
                    background: activity.color,
                    boxShadow: `0 0 10px ${activity.color}`
                  }}
                />
                <div className="flex-1">
                  <p style={{ fontFamily: 'VT323', fontSize: '18px' }}>{activity.text}</p>
                  <p style={{ fontFamily: 'VT323', fontSize: '14px', color: '#606080' }}>{activity.subtext}</p>
                </div>
                <span
                  style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#606080' }}
                >
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Home
