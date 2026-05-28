import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  const googleTokensHeader = req.headers['x-google-tokens']

  if (!googleTokensHeader) {
    return res.status(401).json({ error: 'Google tokens required. Sign in with Google first.' })
  }

  let tokens
  try {
    tokens = JSON.parse(Buffer.from(googleTokensHeader, 'base64').toString())
  } catch {
    return res.status(400).json({ error: 'Invalid tokens format' })
  }

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2.setCredentials(tokens)

    const classroom = google.classroom({ version: 'v1', auth: oauth2 })

    const coursesRes = await classroom.courses.list({ pageSize: 20, courseStates: ['ACTIVE'] })
    const courses = (coursesRes.data.courses || []).map(c => ({
      id: c.id, name: c.name, code: c.enrollmentCode || '',
      instructor: c.teacherFolder?.title || 'Teacher', color: null,
    }))

    const allAssignments = []
    for (const course of courses) {
      try {
        const workRes = await classroom.courses.courseWork.list({ courseId: course.id, pageSize: 50 })
        const work = workRes.data.courseWork || []

        for (const w of work) {
          let status = 'pending'
          try {
            const subRes = await classroom.courses.courseWork.studentSubmissions.list({
              courseId: course.id, courseWorkId: w.id, pageSize: 1,
            })
            const sub = (subRes.data.studentSubmissions || [])[0]
            if (sub?.state === 'TURNED_IN') status = 'submitted'
            else if (sub?.assignedGrade != null) status = 'graded'
          } catch {}

          const due = w.dueDate
            ? new Date(due.year, due.month - 1, due.day, due.dueTime?.hours || 23, due.dueTime?.minutes || 59)
            : null

          allAssignments.push({
            id: w.id, courseId: course.id, courseName: course.name,
            title: w.title, description: w.description || '',
            dueDate: due ? due.toISOString() : null,
            status, priority: due && (new Date(due) - Date.now()) < 2 * 86400000 ? 'high' : 'medium',
            estimatedHours: Math.round((w.maxPoints || 50) / 20) + 1,
            grade: null,
          })
        }
      } catch (e) {
        console.error(`Classroom error course ${course.id}:`, e.message)
      }
    }

    res.json({ courses, assignments: allAssignments })
  } catch (err) {
    console.error('Classroom sync error:', err.message)
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Google session expired. Please sign in again.' })
    }
    res.status(500).json({ error: 'Failed to sync Google Classroom' })
  }
}
