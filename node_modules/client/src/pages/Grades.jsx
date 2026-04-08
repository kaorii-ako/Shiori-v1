import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Calculator,
  TrendingUp,
  Award,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import ProgressBar from '../components/ProgressBar'
import { useGradesStore, useAssignmentsStore } from '../stores'

const Grades = () => {
  const { courseGrades, addGrade, calculateCourseGrade } = useGradesStore()
  const { courses, assignments } = useAssignmentsStore()

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [newGrade, setNewGrade] = useState({ name: '', earned: '', possible: '', weight: '' })
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [goalGrade, setGoalGrade] = useState({ target: '', remaining: '', needed: '' })

  const gradingScale = [
    { min: 93, letter: 'A', gpa: 4.0 },
    { min: 90, letter: 'A-', gpa: 3.7 },
    { min: 87, letter: 'B+', gpa: 3.3 },
    { min: 83, letter: 'B', gpa: 3.0 },
    { min: 80, letter: 'B-', gpa: 2.7 },
    { min: 77, letter: 'C+', gpa: 2.3 },
    { min: 73, letter: 'C', gpa: 2.0 },
    { min: 70, letter: 'C-', gpa: 1.7 },
    { min: 67, letter: 'D+', gpa: 1.3 },
    { min: 63, letter: 'D', gpa: 1.0 },
    { min: 60, letter: 'D-', gpa: 0.7 },
    { min: 0, letter: 'F', gpa: 0.0 }
  ]

  const getGradeInfo = (percentage) => {
    return gradingScale.find(g => percentage >= g.min) || { letter: 'F', gpa: 0 }
  }

  const handleAddGrade = () => {
    if (!selectedCourse || !newGrade.name || !newGrade.earned || !newGrade.possible) return

    addGrade(selectedCourse.id, newGrade.name, {
      name: newGrade.name,
      pointsEarned: parseFloat(newGrade.earned),
      pointsPossible: parseFloat(newGrade.possible),
      weight: newGrade.weight ? parseFloat(newGrade.weight) : null
    })

    setNewGrade({ name: '', earned: '', possible: '', weight: '' })
    setGradeModalOpen(false)
  }

  const calculateGoal = () => {
    const current = calculateCourseGrade(selectedCourse.id)
    if (!current || !goalGrade.target) return

    const target = parseFloat(goalGrade.target)
    setGoalGrade(prev => ({
      ...prev,
      remaining: target.toFixed(1)
    }))
  }

  const course = selectedCourse
  const grades = course ? courseGrades[course.id] : {}
  const courseGrade = course ? calculateCourseGrade(course.id) : null
  const gradeEntries = grades ? Object.entries(grades) : []

  const overallGrade = courseGrade?.percentage || 0
  const gradeInfo = getGradeInfo(parseFloat(overallGrade))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold">Grades</h1>
          <p className="text-text-secondary mt-1">Track your grades and calculate GPA</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-lg">Course Overview</h2>
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const c = courses.find(x => x.id === e.target.value)
                  setSelectedCourse(c || null)
                }}
                className="input-glass min-w-[200px]"
              >
                <option value="">Select a Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {course ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <p className="text-text-muted text-sm">Current Grade</p>
                    <p className="text-3xl font-bold font-mono gradient-text mt-1">
                      {courseGrade ? `${courseGrade.percentage}%` : '--'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <p className="text-text-muted text-sm">Letter Grade</p>
                    <p className="text-3xl font-bold font-mono mt-1">
                      {gradeInfo.letter}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <p className="text-text-muted text-sm">GPA Points</p>
                    <p className="text-3xl font-bold font-mono text-accent-success mt-1">
                      {gradeInfo.gpa.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-secondary">Overall Progress</span>
                    <span className="font-mono">{overallGrade}%</span>
                  </div>
                  <ProgressBar value={overallGrade} max={100} size="lg" />
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Assignments</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setGradeModalOpen(true)}
                    >
                      Add
                    </Button>
                  </div>

                  {gradeEntries.length > 0 ? (
                    <div className="space-y-2">
                      {gradeEntries.map(([id, grade]) => {
                        const pct = (grade.pointsEarned / grade.pointsPossible) * 100
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                pct >= 70 ? 'bg-accent-success/20' : pct >= 50 ? 'bg-accent-warning/20' : 'bg-accent-danger/20'
                              }`}>
                                <Award className={`w-5 h-5 ${
                                  pct >= 70 ? 'text-accent-success' : pct >= 50 ? 'text-accent-warning' : 'text-accent-danger'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{grade.name}</p>
                                <p className="text-xs text-text-muted">
                                  {grade.pointsEarned} / {grade.pointsPossible} pts
                                  {grade.weight && ` • ${grade.weight}% weight`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold">{pct.toFixed(1)}%</p>
                              <Badge variant={pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger'} size="sm">
                                {getGradeInfo(pct).letter}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-muted">
                      <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No grades yet</p>
                      <p className="text-xs">Add your first assignment grade</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">Select a course to view grades</p>
                <p className="text-text-muted text-sm mt-1">Connect Google Classroom to import courses</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              <h2 className="font-heading font-semibold">Grade Scale</h2>
            </div>
            <div className="space-y-2">
              {gradingScale.slice(0, 6).map((g) => (
                <div key={g.letter} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{g.letter}</span>
                  <span className="text-text-muted">{g.min}%+</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-accent-tertiary" />
              <h2 className="font-heading font-semibold">What's My Goal?</h2>
            </div>
            <div className="space-y-3">
              <Input
                label="Target Grade %"
                type="number"
                placeholder="90"
                value={goalGrade.target}
                onChange={(e) => setGoalGrade(prev => ({ ...prev, target: e.target.value }))}
              />
              <Button variant="secondary" className="w-full" onClick={calculateGoal}>
                Calculate
              </Button>
              {goalGrade.remaining && (
                <div className="p-3 rounded-xl bg-accent-primary/10">
                  <p className="text-sm text-text-secondary">You're at {overallGrade}%</p>
                  <p className="text-sm">
                    {parseFloat(overallGrade) >= parseFloat(goalGrade.target)
                      ? "You've already reached your goal!"
                      : `You need ${(parseFloat(goalGrade.target) - parseFloat(overallGrade)).toFixed(1)}% more`
                    }
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <Modal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title="Add Grade"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGrade}>Add Grade</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Assignment Name"
            value={newGrade.name}
            onChange={(e) => setNewGrade(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Midterm Exam"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Points Earned"
              type="number"
              value={newGrade.earned}
              onChange={(e) => setNewGrade(prev => ({ ...prev, earned: e.target.value }))}
              placeholder="85"
            />
            <Input
              label="Points Possible"
              type="number"
              value={newGrade.possible}
              onChange={(e) => setNewGrade(prev => ({ ...prev, possible: e.target.value }))}
              placeholder="100"
            />
          </div>
          <Input
            label="Weight % (optional)"
            type="number"
            value={newGrade.weight}
            onChange={(e) => setNewGrade(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="15"
          />
        </div>
      </Modal>
    </div>
  )
}

export default Grades
