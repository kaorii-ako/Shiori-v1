import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Sparkles } from 'lucide-react'
import { ai } from '../lib/api'
import { useAuthStore } from '../stores'

const AIChat = ({ onClose }) => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || generating) return
    if (!user) {
      setMessages([...messages, { id: Date.now(), role: 'system', content: 'Please sign in to use AI chat.' }])
      return
    }

    const userMsg = { id: Date.now(), role: 'user', content: input.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages((prev) => [...prev, userMsg])

    setGenerating(true)
    setInput('')

    try {
      const reply = await ai(user, input.trim())
      setMessages((prev) => [...prev, reply])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: 'Sorry, something went wrong. Please try again later.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ])
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
        className="flex items-center justify-between px-4 py-3"
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
            <p className="on-surface-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>
              Shiori AI
            </p>
            <p className="on-surface-secondary" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.7rem' }}>
              Your AI Study Buddy
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-sa"
            style={{ color: '#8c90a0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(175, 180, 255, 0.10)'
              e.currentTarget.style.color = '#afc6ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#8c90a0'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: 'rgba(24,28,34,0.30)' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(45deg, rgba(175,198,255,0.15) 0%, rgba(82,141,255,0.10) 100%)' }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#afc6ff' }} />
            </div>
            <p className="on-surface-secondary" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem' }}>
              Ask me anything! I can help with
            </p>
            <ul className="mt-3 space-y-1.5" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.8rem' }}>
              {['Explaining concepts', 'Study tips', 'Summarizing notes', 'Quiz practice'].map((item) => (
                <li key={item} className="on-surface-tertiary">
                  • {item}
                </li>
              ))}
            </ul>
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
              className={`max-w-[80%] max-w-[80%] px-4 py-3 ${msg.role === 'user' ? 'chat-bubble-sent on-surface-primary' : 'chat-bubble-received on-surface-primary'}`}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.875rem',
                background: msg.role === 'user'
                  ? 'linear-gradient(45deg, #a9c2ff 0%, #7ea5ff 100%)'
                  : '#181c22',
                borderRadius: msg.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
              }}
            >
              <p className="leading-relaxed">{msg.content}</p>
              <p className="text-[0.65rem] mt-1.5 on-surface-tertiary">
                {msg.timestamp}
              </p>
            </div>
          </motion.div>
        ))}

        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="chat-bubble-received px-4 py-3" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.875rem' }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#8c90a0' }}
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
      <div className="p-3" style={{ borderTop: '1px solid rgba(66,71,84,0.30)' }}>
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
            className="flex-1 bg-transparent text-on-surface-primary resize-none outline-none min-h-[24px] text-sm"
            style={{ fontFamily: "'Manrope', sans-serif", color: '#dfe2eb' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || generating}
            className="p-2 rounded-lg transition-sa"
            style={{
              background: input.trim() && !generating
                ? 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)'
                : 'rgba(66,71,84,0.25)',
              color: input.trim() && !generating ? '#10141a' : '#606080',
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
