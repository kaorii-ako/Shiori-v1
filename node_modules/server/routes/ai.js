import express from 'express'

const router = express.Router()

// AI Chat endpoint
router.post('/chat', (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Simple rule-based responses for demo
    // In production, this would call Google Gemini or OpenAI
    const lowerMessage = message.toLowerCase()

    // Extract context info for smarter responses
    const assignments = context?.assignments || []
    const courses = context?.courses || []
    const pendingAssignments = assignments.filter(a => a.status !== 'graded')
    const upcomingDeadlines = pendingAssignments
      .filter(a => a.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)

    const courseNames = [...new Set(assignments.map(a => a.courseName).filter(Boolean))]
    const subjectsText = courseNames.length > 0 ? courseNames.join(', ') : 'your courses'

    let response = "I'm here to help! I can assist with your study planning, assignment questions, and time management. What would you like to know?"

    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      if (upcomingDeadlines.length > 0) {
        const deadlinesList = upcomingDeadlines.map(a =>
          `• ${a.title} (${a.courseName || 'Unknown'}): ${new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        ).join('\n')
        response = `I can see you have ${pendingAssignments.length} pending assignments. Here are your upcoming deadlines:\n${deadlinesList}\n\nWould you like me to generate a personalized study plan based on these?`
      } else {
        response = "You don't have any pending assignments right now. Great job staying on top of your work! Would you like me to help you prepare for upcoming topics or create a study schedule?"
      }
    } else if (lowerMessage.includes('study') || lowerMessage.includes('plan')) {
      if (pendingAssignments.length > 0) {
        response = `I can create a personalized study plan for you based on your ${pendingAssignments.length} pending assignments across ${subjectsText}. Just say "yes" and I'll generate a schedule that optimizes your study time based on your upcoming deadlines!`
      } else {
        response = "I don't see any pending assignments in your data. Add some tasks first, or let me know what subjects you'd like to study and I'll create a plan for you!"
      }
    } else if (lowerMessage.includes('grade') || lowerMessage.includes('gpa')) {
      const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.grade)
      if (gradedAssignments.length > 0) {
        const avgGrade = gradedAssignments.reduce((sum, a) =>
          sum + (parseFloat(a.grade.percentage) || 0), 0) / gradedAssignments.length
        response = `I can see you have ${gradedAssignments.length} graded assignments. Your average score so far is ${avgGrade.toFixed(1)}%. Would you like me to analyze your grades by subject or calculate what you need on upcoming assignments to reach a target grade?`
      } else {
        response = "I don't have any graded assignments in your data yet. Keep working on your tasks and I'll help you track your progress and calculate your grades!"
      }
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
      if (upcomingDeadlines.length > 0) {
        const deadlinesList = upcomingDeadlines.map(a =>
          `• ${a.title} - ${a.courseName || 'Unknown'} - Due: ${new Date(a.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
        ).join('\n')
        response = `Based on your data, here are your upcoming deadlines:\n${deadlinesList}\n\nI can help you create a study schedule to complete everything on time. Just ask!`
      } else {
        response = "I don't see any upcoming deadlines in your data. You're all caught up! Would you like to add new assignments or prepare for upcoming course material?"
      }
    } else if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
      response = `I can help you manage your calendar and study schedule! I see you're tracking ${assignments.length} assignments across ${courseNames.length || 'multiple'} subjects. I can create study blocks around your deadlines and help you manage your time effectively.`
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const status = pendingAssignments.length > 0
        ? `You have ${pendingAssignments.length} tasks pending.`
        : "You're all caught up with your tasks!"
      response = `Hey there! I'm Shiori, your AI study companion. ${status} I'm connected to your data to help you stay on top of your work. What can I help you with today?`
    } else if (lowerMessage.includes('help')) {
      response = `I can help you with:\n• Analyzing your ${assignments.length} assignments across ${subjectsText}\n• Creating personalized study plans based on your deadlines\n• Calculating and tracking your grades\n• Managing your study schedule\n• Answering questions about your courses\n\nJust ask me anything or say "generate study plan" to get started!`
    }

    // Check if user wants to generate a study plan
    const wantsStudyPlan = lowerMessage.includes('generate') && (
      lowerMessage.includes('study') || lowerMessage.includes('plan') ||
      lowerMessage.includes('schedule') || lowerMessage === 'yes' ||
      lowerMessage.includes('yes') && lowerMessage.includes('plan')
    )

    if (wantsStudyPlan && pendingAssignments.length > 0) {
      response = {
        message: response,
        shouldGeneratePlan: true,
        planContext: {
          assignments: pendingAssignments,
          courses: courseNames,
          subjects: subjectsText
        }
      }
    }

    res.json(typeof response === 'string' ? { message: response } : response)
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Generate AI study plan
router.post('/study-plan', (req, res) => {
  try {
    const { assignments, preferences } = req.body

    const daysPerWeek = preferences?.daysPerWeek || 5
    const hoursPerDay = preferences?.hoursPerDay || 3

    // Generate a simple study plan based on assignments
    const sessions = []
    const today = new Date()

    // Get pending assignments sorted by due date
    const pendingAssignments = (assignments || [])
      .filter(a => a.status !== 'graded')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    // Create study sessions for each assignment
    pendingAssignments.forEach((assignment, index) => {
      const daysUntilDue = Math.ceil(
        (new Date(assignment.dueDate) - today) / (24 * 60 * 60 * 1000)
      )

      // Create 2-3 study sessions per assignment
      const numSessions = Math.min(Math.ceil(daysUntilDue / 2), 3)

      for (let i = 0; i < numSessions; i++) {
        const sessionDate = new Date(today)
        sessionDate.setDate(today.getDate() + Math.floor((index * 2) + i))

        if (sessionDate <= new Date(assignment.dueDate)) {
          sessions.push({
            id: `session-${assignment.id}-${i}`,
            assignmentId: assignment.id,
            title: `Study: ${assignment.courseName || 'Review'}`,
            date: sessionDate.toISOString(),
            duration: 45 + Math.random() * 45, // 45-90 minutes
            completed: false,
            aiGenerated: true
          })
        }
      }
    })

    const plan = {
      generated: new Date().toISOString(),
      daysPerWeek,
      hoursPerDay,
      totalSessions: sessions.length,
      estimatedHours: sessions.reduce((sum, s) => sum + s.duration, 0) / 60
    }

    res.json({ plan, sessions })
  } catch (error) {
    console.error('Study plan generation error:', error)
    res.status(500).json({ error: 'Failed to generate study plan' })
  }
})

export default router
