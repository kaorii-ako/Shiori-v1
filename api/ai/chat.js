let geminiModel = null

async function getGemini() {
  if (geminiModel) return geminiModel
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(key)
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    return geminiModel
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, context } = req.body || {}
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const assignments = context?.assignments || []
  const pending = assignments.filter(a => a.status !== 'graded' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
  const subjects = [...new Set(assignments.map(a => a.courseName).filter(Boolean))].join(', ') || 'your courses'

  const model = await getGemini()
  if (model) {
    try {
      const systemContext = `You are Shiori (栞), a warm AI study companion. Student data:
- Pending: ${pending.length} assignments in ${subjects}
- Upcoming: ${pending.map(a => `"${a.title}" (${a.courseName}) due ${new Date(a.dueDate).toLocaleDateString()}`).join('; ') || 'none'}
Reply in 2-4 sentences. Be encouraging and specific to their data.`

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemContext }] },
          { role: 'model', parts: [{ text: 'Understood. I am Shiori, your AI study companion.' }] },
        ],
      })
      const result = await chat.sendMessage(message)
      const text = result.response.text()
      const wantsPlan = /generate|create|make.*plan|study.*plan|schedule/i.test(message)
      return res.json({ message: text, ...(wantsPlan && pending.length > 0 ? { shouldGeneratePlan: true } : {}) })
    } catch (err) {
      console.error('Gemini error:', err.message)
    }
  }

  // Fallback when no Gemini key
  const lc = message.toLowerCase()
  let response = `I can see you have ${pending.length} pending assignments. Ask me about deadlines, grades, or say "generate a study plan" to get started.`
  if (lc.includes('due') || lc.includes('deadline')) {
    response = pending.length > 0
      ? `You have ${pending.length} pending assignments. Soonest: "${pending[0].title}" (${pending[0].courseName}) due ${new Date(pending[0].dueDate).toLocaleDateString()}.`
      : "You're all caught up — no upcoming deadlines!"
  } else if (lc.includes('plan') || lc.includes('schedule')) {
    return res.json({ message: `Ready to build your plan! You have ${pending.length} assignments to schedule. Click Generate Plan on the Study Plans page.`, shouldGeneratePlan: true })
  }

  res.json({ message: response })
}
