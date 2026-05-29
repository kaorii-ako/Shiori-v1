import express from 'express'

const router = express.Router()

let geminiModel = null

async function getGemini() {
  if (geminiModel) return geminiModel
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(key)
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    return geminiModel
  } catch {
    return null
  }
}

async function callGemini(model, systemContext, userMessage) {
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'Understood. I am Shiori, your AI study companion. I will help you stay on top of your academics.' }] }
    ]
  })
  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const assignments = context?.assignments || []
    const courses = context?.courses || []
    const pendingAssignments = assignments.filter(a => a.status !== 'graded')
    const upcomingDeadlines = pendingAssignments
      .filter(a => a.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
    const courseNames = [...new Set(assignments.map(a => a.courseName).filter(Boolean))]
    const subjectsText = courseNames.length > 0 ? courseNames.join(', ') : 'your courses'

    const model = await getGemini()
    if (model) {
      const systemContext = `You are Shiori (栞), a warm and knowledgeable AI study companion for students. You have access to the student's current academic data:
- Total assignments: ${assignments.length}
- Pending assignments: ${pendingAssignments.length}
- Subjects: ${subjectsText}
- Upcoming deadlines: ${upcomingDeadlines.map(a => `"${a.title}" (${a.courseName || 'Unknown'}) due ${new Date(a.dueDate).toLocaleDateString()}`).join('; ') || 'none'}

Keep responses concise (2-4 sentences), encouraging, and actionable. You can suggest generating a study plan, analyzing grades, or reviewing deadlines. Use the student's actual data in your responses.`

      try {
        const text = await callGemini(model, systemContext, message)
        const lowerMsg = message.toLowerCase()
        const wantsStudyPlan = (lowerMsg.includes('generate') || lowerMsg.includes('create')) &&
          (lowerMsg.includes('study') || lowerMsg.includes('plan') || lowerMsg.includes('schedule'))
        return res.json({
          message: text,
          ...(wantsStudyPlan && pendingAssignments.length > 0 ? { shouldGeneratePlan: true } : {})
        })
      } catch (geminiErr) {
        console.warn('Gemini error, using fallback:', geminiErr.message)
      }
    }

    // Fallback rule-based responses when Gemini is unavailable
    const lowerMessage = message.toLowerCase()
    const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.grade)
    let response = "I'm here to help you study smarter! I can analyze your assignments, create personalized study plans, and track your deadlines. What would you like to work on?"

    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      if (upcomingDeadlines.length > 0) {
        const list = upcomingDeadlines.map(a =>
          `• ${a.title} (${a.courseName || 'Unknown'}): ${new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        ).join('\n')
        response = `You have ${pendingAssignments.length} pending assignments. Upcoming deadlines:\n${list}\n\nWant me to generate a study plan around these?`
      } else {
        response = "No pending assignments! Great work staying ahead. Want me to help you prepare for upcoming topics?"
      }
    } else if (lowerMessage.includes('study') || lowerMessage.includes('plan') || lowerMessage.includes('schedule')) {
      if (pendingAssignments.length > 0) {
        response = `I'll create a personalized study plan for your ${pendingAssignments.length} pending assignments across ${subjectsText}. Say "generate study plan" and I'll schedule optimal sessions based on your deadlines!`
      } else {
        response = "No pending assignments right now! Add some tasks or let me know what subjects you're studying and I'll build a plan."
      }
    } else if (lowerMessage.includes('grade') || lowerMessage.includes('gpa')) {
      if (gradedAssignments.length > 0) {
        const avg = gradedAssignments.reduce((s, a) => s + (parseFloat(a.grade?.percentage) || 0), 0) / gradedAssignments.length
        response = `You have ${gradedAssignments.length} graded assignments with an average of ${avg.toFixed(1)}%. Want me to break it down by subject or calculate what you need to hit your target grade?`
      } else {
        response = "No graded assignments yet. Keep working and I'll help you track your progress!"
      }
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
      if (upcomingDeadlines.length > 0) {
        const list = upcomingDeadlines.map(a =>
          `• ${a.title} - ${a.courseName || 'Unknown'} — Due: ${new Date(a.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
        ).join('\n')
        response = `Here are your upcoming deadlines:\n${list}\n\nI can build a study schedule to help you hit everything on time!`
      } else {
        response = "No upcoming deadlines — you're all caught up! Want to add new assignments or study proactively?"
      }
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const status = pendingAssignments.length > 0
        ? `You have ${pendingAssignments.length} tasks pending.`
        : "You're all caught up!"
      response = `Hey! I'm Shiori, your AI study companion. ${status} How can I help you today?`
    } else if (lowerMessage.includes('help')) {
      response = `I can help with:\n• Analyzing your ${assignments.length} assignments across ${subjectsText}\n• Creating personalized study plans\n• Tracking grades and GPA\n• Managing deadlines\n\nJust ask, or say "generate study plan" to get started!`
    }

    const wantsStudyPlan = lowerMessage.includes('generate') && (
      lowerMessage.includes('study') || lowerMessage.includes('plan') || lowerMessage === 'yes'
    )

    if (wantsStudyPlan && pendingAssignments.length > 0) {
      return res.json({
        message: response,
        shouldGeneratePlan: true,
        planContext: { assignments: pendingAssignments, courses: courseNames, subjects: subjectsText }
      })
    }

    res.json({ message: response })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Generate AI study plan
router.post('/study-plan', async (req, res) => {
  try {
    const { assignments, preferences } = req.body

    const daysPerWeek = preferences?.daysPerWeek || 5
    const hoursPerDay = preferences?.hoursPerDay || 3
    const today = new Date()

    const pending = (assignments || [])
      .filter(a => a.status !== 'graded' && a.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    // Try Gemini for smarter study plan advice
    const model = await getGemini()
    let aiInsight = null
    if (model && pending.length > 0) {
      try {
        const prompt = `A student has these upcoming assignments: ${pending.map(a =>
          `"${a.title}" (${a.courseName || 'Unknown'}) due ${new Date(a.dueDate).toLocaleDateString()}`
        ).join(', ')}. They study ${daysPerWeek} days/week, ${hoursPerDay} hours/day. Give ONE specific, actionable study tip in 1-2 sentences.`
        aiInsight = await callGemini(model, 'You are a helpful study advisor. Give concise, practical advice.', prompt)
      } catch (e) {
        // ignore gemini errors for study plan insight
      }
    }

    // Build sessions
    const sessions = []
    pending.forEach((assignment, index) => {
      const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - today) / (1000 * 60 * 60 * 24))
      const numSessions = Math.min(Math.max(1, Math.ceil(daysUntilDue / 2)), 3)

      for (let i = 0; i < numSessions; i++) {
        const sessionDate = new Date(today)
        sessionDate.setDate(today.getDate() + (index * 2) + i)
        if (sessionDate <= new Date(assignment.dueDate)) {
          sessions.push({
            id: `session-${assignment.id}-${i}`,
            assignmentId: assignment.id,
            title: `Study: ${assignment.title || assignment.courseName || 'Review'}`,
            subject: assignment.courseName || 'General',
            date: sessionDate.toISOString(),
            duration: 45 + Math.round(Math.random() * 45),
            completed: false,
            aiGenerated: true
          })
        }
      }
    })

    res.json({
      plan: {
        generated: new Date().toISOString(),
        daysPerWeek,
        hoursPerDay,
        totalSessions: sessions.length,
        estimatedHours: +(sessions.reduce((s, x) => s + x.duration, 0) / 60).toFixed(1),
        aiInsight
      },
      sessions
    })
  } catch (error) {
    console.error('Study plan generation error:', error)
    res.status(500).json({ error: 'Failed to generate study plan' })
  }
})

// AI Flashcard Generation from notes
router.post('/flashcards', async (req, res) => {
  try {
    const { content, title } = req.body
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: 'Note content too short to generate flashcards' })
    }

    const model = await getGemini()
    if (model) {
      const prompt = `From the following study notes, generate 5-10 high-quality flashcard question-answer pairs. Focus on key concepts, definitions, formulas, and important facts.

Notes title: ${title || 'Study Notes'}
Notes content:
${content.slice(0, 3000)}

Respond ONLY with a JSON array, no explanation. Format:
[{"front": "question here", "back": "answer here"}, ...]`

      try {
        const raw = await callGemini(model, 'You are a study flashcard generator. Output only valid JSON arrays.', prompt)
        const match = raw.match(/\[[\s\S]*\]/)
        if (!match) throw new Error('No JSON array in response')
        const cards = JSON.parse(match[0])
        if (!Array.isArray(cards) || cards.length === 0) throw new Error('Empty cards array')
        return res.json({ cards: cards.slice(0, 12) })
      } catch (e) {
        console.warn('Gemini flashcard parse error:', e.message)
      }
    }

    // Fallback: extract headings + bullet points as cards
    const lines = content.split('\n').filter(l => l.trim())
    const cards = []
    let lastHeading = null
    lines.forEach(line => {
      if (/^#{1,3}\s/.test(line)) {
        lastHeading = line.replace(/^#{1,3}\s/, '').trim()
      } else if (/^[-*]\s/.test(line) && lastHeading) {
        const point = line.replace(/^[-*]\s/, '').trim()
        if (point.length > 8) {
          cards.push({ front: `What is "${lastHeading}"?`, back: point })
        }
      }
    })
    res.json({ cards: cards.slice(0, 10) })
  } catch (error) {
    console.error('Flashcard generation error:', error)
    res.status(500).json({ error: 'Failed to generate flashcards' })
  }
})

export default router
