import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Bot, User } from 'lucide-react'
import { useUIStore, useAssignmentsStore, useGradesStore } from '../stores'

const AIChat = () => {
  const { aiChatOpen, toggleAIChat, addToast } = useUIStore()
  const { assignments, courses } = useAssignmentsStore()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hey there! I'm 栞 (Shiori), your AI study buddy. I can see you have " + assignments.length + " assignments and " + courses.length + " courses in your data. I can help you organize assignments, answer questions, and create study plans. What do you need help with today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context: {
            assignments,
            courses
          }
        })
      })
      const data = await response.json()

      // Check if the AI wants to generate a study plan
      if (data.shouldGeneratePlan) {
        addToast({
          type: 'success',
          message: 'Study plan context ready! Check the Study page.'
        })
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message
      }])
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to get AI response'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-[420px] h-[560px] z-50 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #12121f 100%)',
        border: '4px solid #c44dff',
        boxShadow: '8px 8px 0 0 #0a0a14, 8px 8px 0 4px #c44dff, 0 0 60px rgba(196,77,255,0.3)'
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,157,0.2) 0%, rgba(196,77,255,0.2) 100%)',
          borderBottom: '2px solid rgba(196,77,255,0.5)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
              boxShadow: '0 0 20px rgba(255,107,157,0.5)',
              imageRendering: 'pixelated'
            }}
          >
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'serif' }}>栞</span>
          </div>
          <div>
            <h3
              className="font-bold gradient-text"
              style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
            >
              SHIORI AI
            </h3>
            <p className="text-xs" style={{ color: '#4dff91', fontFamily: 'VT323', fontSize: '14px' }}>
              Online & Ready
            </p>
          </div>
        </div>
        <button
          onClick={toggleAIChat}
          className="p-2 transition-colors"
          style={{
            background: 'rgba(255,77,106,0.2)',
            border: '2px solid #ff4d6a'
          }}
        >
          <X className="w-5 h-5" style={{ color: '#ff4d6a' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #c44dff 0%, #ff6b9d 100%)',
                  boxShadow: '2px 2px 0 #993d6b'
                }}
              >
                <span style={{ fontFamily: 'serif', color: 'white' }}>栞</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 ${
                message.role === 'user'
                  ? 'text-white'
                  : 'text-text-primary'
              }`}
              style={{
                background: message.role === 'user'
                  ? 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: message.role === 'user'
                  ? '2px solid #ff9dc4'
                  : '2px solid rgba(196,77,255,0.3)',
                fontFamily: 'VT323',
                fontSize: '16px',
                boxShadow: message.role === 'user'
                  ? '2px 2px 0 #993d6b'
                  : 'none'
              }}
            >
              <p>{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div
                className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(77,159,255,0.2)',
                  border: '2px solid #4d9fff'
                }}
              >
                <User className="w-4 h-4" style={{ color: '#4d9fff' }} />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-none flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c44dff 0%, #ff6b9d 100%)' }}
            >
              <span style={{ fontFamily: 'serif', color: 'white' }}>栞</span>
            </div>
            <div
              className="px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(196,77,255,0.3)'
              }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2"
                    style={{ background: '#c44dff', display: 'inline-block' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="p-4"
        style={{
          borderTop: '2px solid rgba(196,77,255,0.5)',
          background: 'rgba(10,10,20,0.5)'
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Shiori anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="input-glass flex-1 pr-12"
            disabled={loading}
            style={{ fontFamily: 'VT323', fontSize: '18px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary px-4"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AIChat
