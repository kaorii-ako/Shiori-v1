import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

const gradesFilePath = path.join(__dirname, '../data/grades.json')

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize grades file if it doesn't exist
if (!fs.existsSync(gradesFilePath)) {
  fs.writeFileSync(gradesFilePath, JSON.stringify({}))
}

// Get all grades
router.get('/', (req, res) => {
  try {
    const grades = JSON.parse(fs.readFileSync(gradesFilePath, 'utf8'))
    res.json(grades)
  } catch (error) {
    console.error('Error reading grades:', error)
    res.status(500).json({ error: 'Failed to fetch grades' })
  }
})

// Save grades
router.post('/', (req, res) => {
  try {
    const { courseId, grades } = req.body

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID required' })
    }

    const allGrades = JSON.parse(fs.readFileSync(gradesFilePath, 'utf8'))

    if (!allGrades[courseId]) {
      allGrades[courseId] = {}
    }

    allGrades[courseId] = { ...allGrades[courseId], ...grades }

    fs.writeFileSync(gradesFilePath, JSON.stringify(allGrades, null, 2))

    res.json({ success: true })
  } catch (error) {
    console.error('Error saving grades:', error)
    res.status(500).json({ error: 'Failed to save grades' })
  }
})

// Calculate grade
router.post('/calculate', (req, res) => {
  try {
    const { courseId, grades } = req.body

    if (!grades || Object.keys(grades).length === 0) {
      return res.json({ percentage: 0, letterGrade: 'N/A', gpa: 0 })
    }

    const entries = Object.values(grades)
    const totalEarned = entries.reduce((sum, g) => sum + (g.pointsEarned || 0), 0)
    const totalPossible = entries.reduce((sum, g) => sum + (g.pointsPossible || 0), 0)

    if (totalPossible === 0) {
      return res.json({ percentage: 0, letterGrade: 'N/A', gpa: 0 })
    }

    const percentage = (totalEarned / totalPossible) * 100

    let letterGrade = 'F'
    let gpa = 0.0

    if (percentage >= 93) { letterGrade = 'A'; gpa = 4.0 }
    else if (percentage >= 90) { letterGrade = 'A-'; gpa = 3.7 }
    else if (percentage >= 87) { letterGrade = 'B+'; gpa = 3.3 }
    else if (percentage >= 83) { letterGrade = 'B'; gpa = 3.0 }
    else if (percentage >= 80) { letterGrade = 'B-'; gpa = 2.7 }
    else if (percentage >= 77) { letterGrade = 'C+'; gpa = 2.3 }
    else if (percentage >= 73) { letterGrade = 'C'; gpa = 2.0 }
    else if (percentage >= 70) { letterGrade = 'C-'; gpa = 1.7 }
    else if (percentage >= 67) { letterGrade = 'D+'; gpa = 1.3 }
    else if (percentage >= 63) { letterGrade = 'D'; gpa = 1.0 }
    else if (percentage >= 60) { letterGrade = 'D-'; gpa = 0.7 }

    res.json({
      percentage: percentage.toFixed(1),
      letterGrade,
      gpa,
      totalEarned,
      totalPossible
    })
  } catch (error) {
    console.error('Error calculating grade:', error)
    res.status(500).json({ error: 'Failed to calculate grade' })
  }
})

export default router
