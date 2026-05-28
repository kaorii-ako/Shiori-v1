import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Sparkles, Zap } from 'lucide-react'
import { ai } from '../lib/api'
import { useAuthStore, useAssignmentsStore } from '../stores'

const QUICK_PROMPTS = [
  "What's due this week?",
  "Generate a study plan",
  "Which assignment should I do first?",
  "How are my grades looking?",
]

// Offline demo responses — contextually aware of demo data
const getDemoResponse = (message, assignments) => {
  const msg = message.toLowerCase()
  const pending = assignments.filter(a => a.status !== 'graded')
  const today = new Date()

  const soonest = pending
    .filter(a => a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]

  if (msg.includes('due') || msg.includes('deadline') || msg.includes('week')) {
    const upcoming = pending
      .filter(a => a.dueDate && new Date(a.dueDate) <= new Date(today.getTime() + 7 * 86400000))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    if (upcoming.length > 0) {
      return `You have ${upcoming.length} assignment${upcoming.length > 1 ? 's' : ''} due this week:\n\n${upcoming.map(a =>
        `• ${a.title} (${a.courseName}) — ${new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
      ).join('\n')}\n\nI'd prioritize the ${upcoming[0].title} first since it's coming up soonest.`
    }
    return "You're all caught up this week — no assignments due in the next 7 days!"
  }

  if (msg.includes('first') || msg.includes('priority') || msg.includes('start') || msg.includes('which')) {
    if (soonest) {
      const high = pending.filter(a => a.priority === 'high')
      const top = high.length > 0 ? high[0] : soonest
      return `Start with **${top.title}** (${top.courseName}). It's ${top.priority === 'high' ? 'high priority' : 'coming up soon'} and estimated at ${top.estimatedHours || 2} hours. Tackle it when you're fresh — morning focus sessions work best for problem sets.`
    }
    return "You're all caught up! No pending assignments right now."
  }

  if (msg.includes('plan') || msg.includes('schedule') || msg.includes('generate')) {
    return `I can generate a personalized study plan for your ${pending.length} pending assignments! Go to the **Study Plans** tab and click "Generate Plan" — I'll build a day-by-day schedule based on your deadlines and estimated hours.`
  }

  if (msg.includes('grade') || msg.includes('gpa') || msg.includes('score')) {
    return `Based on your current grades across all courses, you're averaging around 87% — solid B+ territory. Your Physics and CS grades are strongest. Want me to help you figure out what scores you need on upcoming assignments to hit your target GPA?`
  }

  if (msg.includes('help') || msg.includes('what can') || msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    return `Hey! I'm Shiori (栞), your AI study companion. I can see you have ${pending.length} pending assignments right now.\n\nHere's what I can do:\n• Prioritize your tasks by deadline + weight\n• Generate personalized study plans\n• Track your grades and predict final scores\n• Answer questions about your schedule\n\nWhat would you like to tackle first?`
  }

  if (msg.includes('tip') || msg.includes('advice') || msg.includes('study')) {
    const tips = [
      "The Pomodoro technique works great for your schedule — 25 min focused on one task, then a 5 min break. There's a timer built into Shiori!",
      "Space your study sessions across multiple days rather than cramming the night before. Your brain consolidates memory during sleep.",
      "For your Calculus assignments, try working through one example problem fully before moving to the next. Understanding > volume.",
      "Set your hardest task as the first thing you do — your willpower is highest in the morning.",
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  // Default contextual response
  if (soonest) {
    return `Good question! Right now your most pressing item is **${soonest.title}** due ${new Date(soonest.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}. Would you like me to help you break it down into a study plan?`
  }

  return `I'm here to help you stay on top of your academics! You currently have ${pending.length} pending assignments. Ask me about deadlines, grades, or say "generate a study plan" to get started.`
}

const AIChat = ({ onClose }) => {
  const { user } = useAuthStore()
  const { assignments } = useAssignmentsStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (role, content) => ({
    id: Date.now() + Math.random(),
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })

  const sendMessage = async (text) => {
    const msgText = text || input.trim()
    if (!msgText || generating) return

    setMessages(prev => [...prev, addMessage('user', msgText)])
    setGenerating(true)
    setInput('')

    try {
      if (user?.isDemo) {
        // Offline demo mode — contextual response without backend
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800))
        const reply = getDemoResponse(msgText, assignments)
        setMessages(prev => [...prev, addMessage('assistant', reply)])
      } else {
        const context = { assignments, courses: [] }
        const response = await ai.chat(msgText, context)
        const replyText = response.data?.message || "I'm not sure how to answer that. Try asking about your assignments or grades."
        setMessages(prev => [...prev, addMessage('assistant', replyText)])
      }
    } catch {
      setMessages(prev => [...prev, addMessage('assistant', "Sorry, I couldn't connect to the AI backend. In self-hosted mode, make sure the Express server is running.")])
    }

    setGenerating(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#14181e', borderBottom: '1px solid rgba(66,71,84,0.30)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)', color: '#10141a' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#dfe2eb' }}>
              Shiori AI
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.7rem', color: '#606080' }}>
              {user?.isDemo ? 'Demo Mode — offline AI' : 'Powered by Gemini'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-sa"
            style={{ color: '#8c90a0', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#afc6ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8c90a0' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: 'rgba(24,28,34,0.30)' }}>
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div
              className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(45deg, rgba(175,198,255,0.15) 0%, rgba(82,141,255,0.10) 100%)' }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#afc6ff' }} />
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem', color: '#8c90a0' }}>
              Ask me anything about your schedule
            </p>
            <div className="mt-4 space-y-2">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-sa"
                  style={{
                    background: 'rgba(82,141,255,0.06)',
                    border: '1px solid rgba(82,141,255,0.15)',
                    color: '#8c90a0',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(82,141,255,0.12)'; e.currentTarget.style.color = '#afc6ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(82,141,255,0.06)'; e.currentTarget.style.color = '#8c90a0' }}
                >
                  <Zap size={11} style={{ display: 'inline', marginRight: 6 }} />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] px-4 py-3`}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: msg.role === 'user'
                  ? 'linear-gradient(45deg, #a9c2ff 0%, #7ea5ff 100%)'
                  : '#181c22',
                color: msg.role === 'user' ? '#10141a' : '#dfe2eb',
                borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(66,71,84,0.25)',
              }}
            >
              <p>{msg.content}</p>
              <p style={{ fontSize: '0.65rem', marginTop: 4, opacity: 0.6 }}>{msg.timestamp}</p>
            </div>
          </motion.div>
        ))}

        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div style={{
              padding: '12px 16px', borderRadius: '10px 10px 10px 2px',
              background: '#181c22', border: '1px solid rgba(66,71,84,0.25)',
            }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#8c90a0', display: 'block' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(66,71,84,0.30)' }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#14181e', border: '1px solid rgba(66,71,84,0.40)' }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Shiori..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none min-h-[24px] text-sm"
            style={{ fontFamily: "'Manrope', sans-serif", color: '#dfe2eb' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || generating}
            className="p-2 rounded-lg transition-sa"
            style={{
              background: input.trim() && !generating
                ? 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)'
                : 'rgba(66,71,84,0.25)',
              color: input.trim() && !generating ? '#10141a' : '#606080',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            }}
          >
            <Send className="w-4 h-4" style={{ display: 'block' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIChat
