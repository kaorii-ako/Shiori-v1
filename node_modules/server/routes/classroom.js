import express from 'express'
import { getClassroom } from '../services/google.js'

const router = express.Router()

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const classroom = getClassroom()

    const response = await classroom.courses.list({
      pageSize: 100,
      courseStates: ['ACTIVE']
    })

    const courses = response.data.courses || []

    // Return formatted courses
    const formattedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      teacher: course.teacherView?.profile?.name?.fullName || course.descriptionHeading || 'Teacher',
      room: course.room || null,
      section: course.section || null,
      description: course.description || null
    }))

    res.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error.message)

    // Return mock data if not authenticated
    if (error.message === 'Not authenticated with Google') {
      res.json(getMockCourses())
    } else {
      res.status(500).json({ error: 'Failed to fetch courses' })
    }
  }
})

// Get course work for a specific course
router.get('/courses/:courseId/course-work', async (req, res) => {
  try {
    const { courseId } = req.params
    const classroom = getClassroom()

    const response = await classroom.courses.courseWork.list({
      courseId,
      pageSize: 100
    })

    const courseWork = response.data.courseWork || []

    const formatted = courseWork.map(work => ({
      id: work.id,
      courseId,
      title: work.title,
      description: work.description || '',
      dueDate: work.dueDate ? new Date(
        work.dueDate.year,
        work.dueDate.month - 1,
        work.dueDate.day,
        work.dueTime?.hours || 23,
        work.dueTime?.minutes || 59
      ) : null,
      pointsPossible: work.maxPoints || 100,
      workType: work.workType,
      state: work.state,
      link: work.alternateLink
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching course work:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json(getMockCourseWork(req.params.courseId))
    } else {
      res.status(500).json({ error: 'Failed to fetch course work' })
    }
  }
})

// Get submissions for course work
router.get('/courses/:courseId/course-work/:courseWorkId/submissions', async (req, res) => {
  try {
    const { courseId, courseWorkId } = req.params
    const classroom = getClassroom()

    const response = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId,
      pageSize: 100
    })

    const submissions = response.data.studentSubmissions || []

    const formatted = submissions.map(sub => ({
      id: sub.id,
      courseWorkId: sub.courseWorkId,
      state: sub.state,
      assignedGrade: sub.assignedGrade,
      draftGrade: sub.draftGrade,
      submissionDate: sub.creationTime,
      dueDate: sub.dueDate
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching submissions:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json([])
    } else {
      res.status(500).json({ error: 'Failed to fetch submissions' })
    }
  }
})

// Get all assignments from all courses
router.get('/assignments', async (req, res) => {
  try {
    const classroom = getClassroom()

    // First get all courses
    const coursesResponse = await classroom.courses.list({
      pageSize: 100,
      courseStates: ['ACTIVE']
    })

    const courses = coursesResponse.data.courses || []

    // Then get course work for each course
    const allAssignments = []

    for (const course of courses) {
      try {
        const workResponse = await classroom.courses.courseWork.list({
          courseId: course.id,
          pageSize: 100
        })

        const courseWork = workResponse.data.courseWork || []

        // Get submissions for each piece of work
        for (const work of courseWork) {
          try {
            const subsResponse = await classroom.courses.courseWork.studentSubmissions.list({
              courseId: course.id,
              courseWorkId: work.id,
              pageSize: 10
            })

            const submissions = subsResponse.data.studentSubmissions || []

            // Find our submission (assuming first one for demo)
            const mySubmission = submissions[0] || {}

            allAssignments.push({
              id: work.id,
              courseId: course.id,
              courseName: course.name,
              title: work.title,
              description: work.description || '',
              dueDate: work.dueDate ? new Date(
                work.dueDate.year,
                work.dueDate.month - 1,
                work.dueDate.day,
                work.dueTime?.hours || 23,
                work.dueTime?.minutes || 59
              ) : null,
              status: mapSubmissionState(mySubmission.state),
              grade: mySubmission.assignedGrade !== undefined ? {
                pointsEarned: mySubmission.assignedGrade,
                pointsPossible: work.maxPoints || 100,
                percentage: ((mySubmission.assignedGrade / (work.maxPoints || 100)) * 100).toFixed(1)
              } : null,
              link: work.alternateLink
            })
          } catch (e) {
            console.error(`Error fetching submissions for ${work.id}:`, e.message)
          }
        }
      } catch (e) {
        console.error(`Error fetching work for course ${course.id}:`, e.message)
      }
    }

    res.json(allAssignments)
  } catch (error) {
    console.error('Error fetching all assignments:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json(getMockAssignments())
    } else {
      res.status(500).json({ error: 'Failed to fetch assignments' })
    }
  }
})

const mapSubmissionState = (state) => {
  switch (state) {
    case 'NEW': return 'pending'
    case 'CREATED': return 'pending'
    case 'TURNED_IN': return 'submitted'
    case 'RETURNED': return 'submitted'
    case 'RECLAIMED_BY_STUDENT': return 'pending'
    default: return 'pending'
  }
}

// Mock data for demo/offline mode
const getMockCourses = () => [
  { id: '1', name: 'Biology 101', teacher: 'Dr. Smith', room: 'Lab 201' },
  { id: '2', name: 'Chemistry', teacher: 'Prof. Johnson', room: 'Lab 305' },
  { id: '3', name: 'Mathematics', teacher: 'Ms. Williams', room: 'Room 102' },
  { id: '4', name: 'Physics', teacher: 'Dr. Brown', room: 'Lab 401' },
  { id: '5', name: 'English Literature', teacher: 'Mrs. Davis', room: 'Room 205' }
]

const getMockCourseWork = (courseId) => [
  {
    id: `${courseId}-1`,
    courseId,
    title: 'Homework Assignment #5',
    description: 'Complete exercises 1-10 from Chapter 5',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    pointsPossible: 100,
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED'
  }
]

const getMockAssignments = () => {
  const courses = getMockCourses()
  const now = Date.now()

  return [
    {
      id: '1-1',
      courseId: '1',
      courseName: 'Biology 101',
      title: 'Cell Division Essay',
      description: 'Write a 1000-word essay on mitosis and meiosis',
      dueDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      grade: null,
      link: 'https://classroom.google.com'
    },
    {
      id: '1-2',
      courseId: '1',
      courseName: 'Biology 101',
      title: 'Lab Report #3',
      description: 'Document findings from the onion cell experiment',
      dueDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
      grade: null,
      link: 'https://classroom.google.com'
    },
    {
      id: '2-1',
      courseId: '2',
      courseName: 'Chemistry',
      title: 'Chemical Reactions Homework',
      description: 'Problems 1-20 from Chapter 4',
      dueDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
      status: 'submitted',
      grade: { pointsEarned: 92, pointsPossible: 100, percentage: '92.0' },
      link: 'https://classroom.google.com'
    },
    {
      id: '3-1',
      courseId: '3',
      courseName: 'Mathematics',
      title: 'Calculus Problem Set 7',
      description: 'Integration problems',
      dueDate: new Date(now + 4 * 24 * 60 * 60 * 1000),
      status: 'pending',
      grade: null,
      link: 'https://classroom.google.com'
    },
    {
      id: '3-2',
      courseId: '3',
      courseName: 'Mathematics',
      title: 'Quiz #4',
      description: 'Derivatives review',
      dueDate: new Date(now - 1 * 24 * 60 * 60 * 1000),
      status: 'graded',
      grade: { pointsEarned: 85, pointsPossible: 100, percentage: '85.0', letterGrade: 'B' },
      link: 'https://classroom.google.com'
    },
    {
      id: '4-1',
      courseId: '4',
      courseName: 'Physics',
      title: 'Motion Lab Report',
      description: 'Analyze the motion of the cart',
      dueDate: new Date(now + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      grade: null,
      link: 'https://classroom.google.com'
    },
    {
      id: '5-1',
      courseId: '5',
      courseName: 'English Literature',
      title: 'Shakespeare Analysis',
      description: 'Essay on Hamlet themes',
      dueDate: new Date(now + 6 * 24 * 60 * 60 * 1000),
      status: 'pending',
      grade: null,
      link: 'https://classroom.google.com'
    }
  ]
}

export default router
