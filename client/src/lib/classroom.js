/**
 * Google Classroom REST client — runs entirely in the browser.
 *
 * After the student signs in with Google (Supabase OAuth), we hold a Google
 * access token (`provider_token`) carrying the student Classroom scopes:
 *   - classroom.courses.readonly
 *   - classroom.coursework.me.readonly
 *   - classroom.student-submissions.me.readonly
 *
 * Google's REST APIs send permissive CORS headers, so we can call
 * classroom.googleapis.com directly from the client with a Bearer token —
 * no backend/proxy required. Everything here is read-only.
 */

const BASE = 'https://classroom.googleapis.com/v1'

// Stable, friendly course colors (cycled by index).
const PALETTE = ['#528dff', '#c44dff', '#4dff91', '#ff6b9d', '#ffd6a0', '#afc6ff', '#e5b5ff', '#d7ffc5']
function hashColor(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

/** Thrown when Google rejects the token (expired / revoked). The UI uses this to prompt a reconnect. */
export class ClassroomAuthError extends Error {
  constructor(message = 'Your Google session expired. Reconnect Google Classroom.') {
    super(message)
    this.name = 'ClassroomAuthError'
  }
}

async function gapi(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401 || res.status === 403) {
    throw new ClassroomAuthError()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Classroom request failed (${res.status})`)
  }
  return res.json()
}

/** GET that follows nextPageToken and concatenates `key` from every page. */
async function paginate(path, token, key) {
  const sep = path.includes('?') ? '&' : '?'
  let pageToken = ''
  const out = []
  // Guard against runaway pagination.
  for (let i = 0; i < 25; i++) {
    const url = `${path}${pageToken ? `${sep}pageToken=${pageToken}` : ''}`
    const data = await gapi(url, token)
    if (Array.isArray(data[key])) out.push(...data[key])
    if (!data.nextPageToken) break
    pageToken = data.nextPageToken
    if (i === 24) console.warn('[classroom] paginate: 25-page limit reached on', path, '— some items may be missing')
  }
  return out
}

function mapStatus(state) {
  switch (state) {
    case 'TURNED_IN': return 'submitted'
    case 'RETURNED': return 'graded'
    case 'RECLAIMED_BY_STUDENT': return 'pending'
    default: return 'pending'
  }
}

function classroomDueToISO(work) {
  if (!work.dueDate) return null
  const { year, month, day } = work.dueDate
  const t = work.dueTime || {}
  // Classroom due dates/times are in UTC.
  return new Date(Date.UTC(year, month - 1, day, t.hours ?? 23, t.minutes ?? 59)).toISOString()
}

/**
 * Pull the signed-in student's active courses, their coursework, and the
 * student's own submissions (for status + grades). Returns app-shaped
 * { courses, assignments } objects ready to merge into the assignments store.
 *
 * Per-course failures are swallowed so one locked course can't break the sync.
 */
export async function fetchClassroomData(token) {
  if (!token) throw new ClassroomAuthError('No Google token — connect Google Classroom first.')

  const rawCourses = await paginate('/courses?courseStates=ACTIVE&pageSize=100', token, 'courses')

  const courses = []
  const assignments = []

  for (let i = 0; i < rawCourses.length; i++) {
    const c = rawCourses[i]
    const courseId = `gc-${c.id}`
    courses.push({
      id: courseId,
      classroomId: c.id,
      name: c.name || 'Untitled Course',
      code: c.section || c.room || c.enrollmentCode || '',
      color: hashColor(c.id),
      instructor: c.descriptionHeading || '',
      credits: 3,
      source: 'classroom',
      link: c.alternateLink || null,
    })

    let work = []
    let submissions = []
    try {
      work = await paginate(
        `/courses/${c.id}/courseWork?courseWorkStates=PUBLISHED&pageSize=100`,
        token, 'courseWork',
      )
    } catch (e) {
      if (e instanceof ClassroomAuthError) throw e
      // Can't read this course's coursework (e.g. teacher-only) — skip it entirely.
      continue
    }
    try {
      // One call returns every submission of mine across all coursework in this course.
      submissions = await paginate(
        `/courses/${c.id}/courseWork/-/studentSubmissions?userId=me&pageSize=100`,
        token, 'studentSubmissions',
      )
    } catch (e) {
      if (e instanceof ClassroomAuthError) throw e
      // Couldn't load my submissions — still import the coursework, just without grades.
      submissions = []
    }

    const subByWork = new Map(submissions.map(s => [s.courseWorkId, s]))

    for (const w of work) {
      const sub = subByWork.get(w.id) || {}
      const maxPoints = w.maxPoints || null
      const graded = sub.assignedGrade != null
      const dueISO = classroomDueToISO(w)
      const soon = dueISO && new Date(dueISO) - Date.now() < 2 * 24 * 60 * 60 * 1000

      assignments.push({
        id: `gc-${c.id}-${w.id}`,
        classroomId: w.id,
        courseId,
        courseName: c.name,
        course: c.name,
        title: w.title || 'Untitled',
        description: w.description || '',
        dueDate: dueISO,
        status: mapStatus(sub.state),
        completed: sub.state === 'TURNED_IN' || sub.state === 'RETURNED' || graded,
        priority: soon ? 'high' : 'medium',
        estimatedHours: Math.max(1, Math.round((maxPoints || 40) / 25)),
        grade: graded
          ? {
              pointsEarned: sub.assignedGrade,
              pointsPossible: maxPoints || 100,
              percentage: ((sub.assignedGrade / (maxPoints || 100)) * 100).toFixed(1),
            }
          : null,
        maxPoints,
        source: 'classroom',
        link: w.alternateLink || null,
      })
    }
  }

  return { courses, assignments }
}
