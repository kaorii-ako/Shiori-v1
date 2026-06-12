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

function buildSessions(assignments) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pending = assignments
    .filter(a => a.status !== 'graded' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { date: d, sessions: [] }
  })

  pending.forEach(a => {
    const daysUntil = Math.max(0, Math.floor((new Date(a.dueDate) - today) / 86400000))
    const numSessions = Math.min(Math.ceil((a.estimatedHours || 2) / 1.5), 3)
    for (let s = 0; s < numSessions; s++) {
      const dayOffset = Math.max(0, Math.min(6, daysUntil - numSessions + s + 1))
      slots[dayOffset].sessions.push({
        id: `${a.id}-${s}`,
        title: a.title,
        courseName: a.courseName,
        courseId: a.courseId,
        date: slots[dayOffset].date,
        duration: s === 0 ? 90 : 60,
        completed: false,
        aiGenerated: true,
        priority: a.priority || 'medium',
      })
    }
  })
  return slots.flatMap(s => s.sessions)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { assignments = [], preferences = {} } = req.body || {}
  const sessions = buildSessions(assignments)
  const pending = assignments.filter(a => a.status !== 'graded' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  let insight = null
  const model = await getGemini()
  if (model && pending.length > 0) {
    try {
      const prompt = `Student has: ${pending.map(a => `"${a.title}" (${a.courseName}) due ${new Date(a.dueDate).toLocaleDateString()}, ${a.estimatedHours || 2}h estimated`).join('; ')}. They study ${preferences.daysPerWeek || 5} days/week, ${preferences.hoursPerDay || 3}h/day. Give ONE specific, encouraging study tip in 1-2 sentences. Mention the most urgent assignment by name.`
      const result = await model.generateContent(prompt)
      insight = result.response.text()
    } catch (err) {
      console.error('Gemini study plan error:', err.message)
    }
  }

  res.json({ sessions, plan: { totalSessions: sessions.length }, insight })
}
