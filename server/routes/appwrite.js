import express from 'express'
import { appwriteService } from '../services/appwrite.js'

const router = express.Router()

// Get all student data (assignments, courses, grades, events)
router.get('/sync/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const data = await appwriteService.syncStudentData(studentId)
    res.json(data)
  } catch (error) {
    console.error('Appwrite sync error:', error)
    res.status(500).json({ error: 'Failed to sync data from Appwrite' })
  }
})

// Assignments
router.get('/assignments/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const assignments = await appwriteService.getAssignments(studentId)
    res.json(assignments)
  } catch (error) {
    console.error('Get assignments error:', error)
    res.status(500).json({ error: 'Failed to get assignments' })
  }
})

router.post('/assignments', async (req, res) => {
  try {
    const assignment = await appwriteService.createAssignment(req.body)
    res.json(assignment)
  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({ error: 'Failed to create assignment' })
  }
})

router.put('/assignments/:assignmentId', async (req, res) => {
  try {
    const assignment = await appwriteService.updateAssignment(req.params.assignmentId, req.body)
    res.json(assignment)
  } catch (error) {
    console.error('Update assignment error:', error)
    res.status(500).json({ error: 'Failed to update assignment' })
  }
})

router.delete('/assignments/:assignmentId', async (req, res) => {
  try {
    await appwriteService.deleteAssignment(req.params.assignmentId)
    res.json({ success: true })
  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({ error: 'Failed to delete assignment' })
  }
})

// Courses
router.get('/courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const courses = await appwriteService.getCourses(studentId)
    res.json(courses)
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({ error: 'Failed to get courses' })
  }
})

router.post('/courses', async (req, res) => {
  try {
    const course = await appwriteService.createCourse(req.body)
    res.json(course)
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// Grades
router.get('/grades/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const { courseId } = req.query
    const grades = await appwriteService.getGrades(studentId, courseId)
    res.json(grades)
  } catch (error) {
    console.error('Get grades error:', error)
    res.status(500).json({ error: 'Failed to get grades' })
  }
})

router.post('/grades', async (req, res) => {
  try {
    const grade = await appwriteService.saveGrade(req.body)
    res.json(grade)
  } catch (error) {
    console.error('Save grade error:', error)
    res.status(500).json({ error: 'Failed to save grade' })
  }
})

// Events
router.get('/events/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const { timeMin, timeMax } = req.query
    const events = await appwriteService.getEvents(studentId, timeMin, timeMax)
    res.json(events)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Failed to get events' })
  }
})

router.post('/events', async (req, res) => {
  try {
    const event = await appwriteService.createEvent(req.body)
    res.json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

router.put('/events/:eventId', async (req, res) => {
  try {
    const event = await appwriteService.updateEvent(req.params.eventId, req.body)
    res.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

router.delete('/events/:eventId', async (req, res) => {
  try {
    await appwriteService.deleteEvent(req.params.eventId)
    res.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// Study Plans
router.post('/study-plans', async (req, res) => {
  try {
    const { studentId, ...planData } = req.body
    const plan = await appwriteService.saveStudyPlan(studentId, planData)
    res.json(plan)
  } catch (error) {
    console.error('Save study plan error:', error)
    res.status(500).json({ error: 'Failed to save study plan' })
  }
})

router.get('/study-plans/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const plans = await appwriteService.getStudyPlans(studentId)
    res.json(plans)
  } catch (error) {
    console.error('Get study plans error:', error)
    res.status(500).json({ error: 'Failed to get study plans' })
  }
})

export default router
