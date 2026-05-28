import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Calculator,
  TrendingUp,
  Award,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import ProgressBar from '../components/ProgressBar'
import { useGradesStore, useAssignmentsStore } from '../stores'

const GRADE_SCALE = [
  { min: 93, letter: 'A', gpa: 4.0, color: '#4dff91' },
  { min: 90, letter: 'A-', gpa: 3.7, color: '#4dff91' },
  { min: 87, letter: 'B+', gpa: 3.3, color: '#afc6ff' },
  { min: 83, letter: 'B', gpa: 3.0, color: '#afc6ff' },
  { min: 80, letter: 'B-', gpa: 2.7, color: '#afc6ff' },
  { min: 77, letter: 'C+', gpa: 2.3, color: '#ffd6a0' },
  { min: 73, letter: 'C', gpa: 2.0, color: '#ffd6a0' },
  { min: 70, letter: 'C-', gpa: 1.7, color: '#ffd6a0' },
  { min: 67, letter: 'D+', gpa: 1.3, color: '#ff8f6b' },
  { min: 63, letter: 'D', gpa: 1.0, color: '#ff8f6b' },
  { min: 60, letter: 'D-', gpa: 0.7, color: '#ff8f6b' },
  { min: 0, letter: 'F', gpa: 0.0, color: '#ff4d6a' }
]

const getGradeInfo = (pct) => GRADE_SCALE.find(g => pct >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1]

const CourseCard = ({ course, pct, gradeInfo, isSelected, onClick }) => (
  <motion.div
    whileHover={{ translateY: -2 }}
    onClick={onClick}
    style={{
      padding: '14px 16px', cursor: 'pointer', borderRadius: 8,
      background: isSelected ? 'rgba(196,77,255,0.12)' : 'rgba(255,255,255,0.03)',
      border: `2px solid ${isSelected ? 'rgba(196,77,255,0.5)' : 'rgba(255,255,255,0.07)'}`,
      boxShadow: isSelected ? '0 0 12px rgba(196,77,255,0.15)' : 'none',
      transition: 'all 0.15s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: course.color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'VT323', fontSize: 18, color: '#dfe2eb' }}>{course.name}</span>
      </div>
      <span style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: gradeInfo.color }}>
        {pct !== null ? `${pct}%` : '—'} {gradeInfo.letter}
      </span>
    </div>
    {pct !== null && (
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: course.color, borderRadius: 2 }} />
      </div>
    )}
  </motion.div>
)

const Grades = () => {
  const { courseGrades, addGrade, calculateCourseGrade } = useGradesStore()
  const { courses, assignments } = useAssignmentsStore()

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [newGrade, setNewGrade] = useState({ name: '', earned: '', possible: '', weight: '' })

  // Grade predictor state
  const [predTarget, setPredTarget] = useState('')
  const [predFinalWeight, setPredFinalWeight] = useState('30')
  const [predResult, setPredResult] = useState(null)

  const courseSummaries = useMemo(() => {
    if (!courses?.length) return []
    return courses.map(c => {
      const grades = courseGrades[c.id]
      if (!grades) return { ...c, pct: null, gradeInfo: { letter: '—', gpa: 0, color: '#606080' } }
      let pts = 0, poss = 0
      Object.values(grades).forEach(g => { pts += g.pointsEarned; poss += g.pointsPossible })
      const pct = poss > 0 ? parseFloat((pts / poss * 100).toFixed(1)) : null
      return { ...c, pct, gradeInfo: pct !== null ? getGradeInfo(pct) : { letter: '—', gpa: 0, color: '#606080' } }
    })
  }, [courses, courseGrades])

  const overallGPA = useMemo(() => {
    const withGrades = courseSummaries.filter(c => c.pct !== null)
    if (!withGrades.length) return null
    const sum = withGrades.reduce((acc, c) => acc + c.gradeInfo.gpa, 0)
    return (sum / withGrades.length).toFixed(2)
  }, [courseSummaries])

  const handleAddGrade = () => {
    if (!selectedCourse || !newGrade.name || !newGrade.earned || !newGrade.possible) return
    addGrade(selectedCourse.id, `${Date.now()}`, {
      name: newGrade.name,
      pointsEarned: parseFloat(newGrade.earned),
      pointsPossible: parseFloat(newGrade.possible),
    })
    setNewGrade({ name: '', earned: '', possible: '', weight: '' })
    setGradeModalOpen(false)
  }

  const calculatePrediction = () => {
    if (!selectedCourse || !predTarget) return
    const courseGrade = calculateCourseGrade(selectedCourse.id)
    if (!courseGrade) return

    const currentPct = parseFloat(courseGrade.percentage)
    const targetPct = parseFloat(predTarget)
    const finalWeight = parseFloat(predFinalWeight) / 100

    // current = (1 - finalWeight) * courseworkPct + finalWeight * finalScore
    // solve for finalScore
    const needed = (targetPct - (1 - finalWeight) * currentPct) / finalWeight

    setPredResult({
      current: currentPct.toFixed(1),
      target: targetPct,
      finalWeight: parseFloat(predFinalWeight),
      needed: needed.toFixed(1),
      possible: needed <= 100,
      easy: needed <= currentPct,
    })
  }

  const course = selectedCourse
  const grades = course ? courseGrades[course.id] : {}
  const courseGrade = course ? calculateCourseGrade(course.id) : null
  const gradeEntries = grades ? Object.entries(grades) : []
  const overallGrade = courseGrade?.percentage || 0
  const gradeInfo = getGradeInfo(parseFloat(overallGrade))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
            background: 'linear-gradient(135deg, #afc6ff, #e5b5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GRADES
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
            Track grades and predict your finals
          </p>
        </div>
        {overallGPA && (
          <div style={{ textAlign: 'center', padding: '10px 20px',
            background: 'rgba(77,255,145,0.08)', border: '2px solid rgba(77,255,145,0.3)',
            borderRadius: 8 }}>
            <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', marginBottom: 4 }}>CUMULATIVE GPA</p>
            <p style={{ fontFamily: '"Press Start 2P"', fontSize: 24, color: '#4dff91' }}>{overallGPA}</p>
          </div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left: Course list */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard style={{ height: '100%' }}>
            <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, marginBottom: 14, color: '#8c90a0' }}>
              YOUR COURSES
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {courseSummaries.length > 0 ? courseSummaries.map(c => (
                <CourseCard key={c.id} course={c} pct={c.pct} gradeInfo={c.gradeInfo}
                  isSelected={selectedCourse?.id === c.id}
                  onClick={() => { setSelectedCourse(c); setPredResult(null) }} />
              )) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#606080' }}>
                  <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontFamily: 'VT323', fontSize: 16 }}>No courses yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right: Grade detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {course ? (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <GlassCard>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: course.color }} />
                      <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#dfe2eb' }}>{course.name}</h2>
                    </div>
                    <Button size="sm" variant="secondary" icon={Plus} onClick={() => setGradeModalOpen(true)}>
                      ADD GRADE
                    </Button>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Current Grade', value: courseGrade ? `${courseGrade.percentage}%` : '—', color: gradeInfo.color },
                      { label: 'Letter Grade', value: gradeInfo.letter, color: gradeInfo.color },
                      { label: 'GPA Points', value: gradeInfo.gpa.toFixed(1), color: '#4dff91' },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '14px 12px', textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                        <p style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080', marginBottom: 6 }}>{s.label}</p>
                        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 18, color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'VT323', fontSize: 15, color: '#8c90a0' }}>Overall Progress</span>
                      <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: gradeInfo.color }}>{overallGrade}%</span>
                    </div>
                    <ProgressBar value={parseFloat(overallGrade)} max={100} size="lg" />
                  </div>

                  {/* Grade list */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#8c90a0' }}>ASSIGNMENTS</h3>
                  </div>

                  {gradeEntries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {gradeEntries.map(([id, grade]) => {
                        const pct = (grade.pointsEarned / grade.pointsPossible) * 100
                        const gi = getGradeInfo(pct)
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', background: `${gi.color}18`, flexShrink: 0 }}>
                                <Award size={16} style={{ color: gi.color }} />
                              </div>
                              <div>
                                <p style={{ fontFamily: 'VT323', fontSize: 18 }}>{grade.name}</p>
                                <p style={{ fontFamily: 'VT323', fontSize: 13, color: '#606080' }}>
                                  {grade.pointsEarned} / {grade.pointsPossible} pts
                                </p>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: gi.color }}>{pct.toFixed(1)}%</p>
                              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080' }}>{gi.letter}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#606080' }}>
                      <Calculator size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p style={{ fontFamily: 'VT323', fontSize: 16 }}>No grades yet — add your first assignment</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>

              {/* Grade Predictor */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <GlassCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Sparkles size={16} style={{ color: '#c44dff' }} />
                    <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10,
                      background: 'linear-gradient(135deg, #c44dff, #afc6ff)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      FINAL EXAM PREDICTOR
                    </h2>
                  </div>
                  <p style={{ fontFamily: 'VT323', fontSize: 16, color: '#8c90a0', marginBottom: 16 }}>
                    What score do you need on the final to hit your target grade?
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', display: 'block', marginBottom: 6 }}>
                        TARGET GRADE %
                      </label>
                      <input
                        type="number" min="0" max="100" placeholder="e.g. 90"
                        value={predTarget}
                        onChange={e => { setPredTarget(e.target.value); setPredResult(null) }}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#dfe2eb',
                          fontFamily: '"Press Start 2P"', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', display: 'block', marginBottom: 6 }}>
                        FINAL EXAM WEIGHT %
                      </label>
                      <input
                        type="number" min="1" max="100" placeholder="e.g. 30"
                        value={predFinalWeight}
                        onChange={e => { setPredFinalWeight(e.target.value); setPredResult(null) }}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#dfe2eb',
                          fontFamily: '"Press Start 2P"', fontSize: 12 }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={calculatePrediction}
                    style={{ width: '100%', padding: '10px', background: 'rgba(196,77,255,0.15)',
                      border: '2px solid rgba(196,77,255,0.4)', borderRadius: 6, cursor: 'pointer',
                      fontFamily: '"Press Start 2P"', fontSize: 10, color: '#c44dff', marginBottom: predResult ? 14 : 0 }}>
                    CALCULATE
                  </button>

                  {predResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ padding: '16px 18px',
                        background: predResult.possible ? 'rgba(77,255,145,0.06)' : 'rgba(255,77,106,0.06)',
                        border: `2px solid ${predResult.possible ? 'rgba(77,255,145,0.3)' : 'rgba(255,77,106,0.3)'}`,
                        borderRadius: 8 }}>
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#8c90a0', marginBottom: 6 }}>
                          YOU NEED ON THE FINAL
                        </p>
                        <p style={{ fontFamily: '"Press Start 2P"', fontSize: 32,
                          color: !predResult.possible ? '#ff4d6a' : predResult.easy ? '#4dff91' : '#ffd6a0' }}>
                          {parseFloat(predResult.needed) > 100 ? '100+%' : predResult.needed < 0 ? 'DONE!' : `${predResult.needed}%`}
                        </p>
                      </div>
                      <p style={{ fontFamily: 'VT323', fontSize: 16, color: '#8c90a0', textAlign: 'center' }}>
                        {parseFloat(predResult.needed) < 0
                          ? `You've already secured ${predTarget}%! Just show up 🎉`
                          : parseFloat(predResult.needed) > 100
                          ? `Not possible to reach ${predTarget}% — aim for your best and maximize other assignments.`
                          : predResult.easy
                          ? `You're on track! A score similar to your current average gets you there.`
                          : `Push hard on the final — your current average is ${predResult.current}%.`}
                      </p>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard>
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <Target size={48} style={{ margin: '0 auto 16px', color: '#424754' }} />
                  <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: '#606080', marginBottom: 10 }}>
                    SELECT A COURSE
                  </p>
                  <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#424754' }}>
                    Pick a course from the left to view grades and predict your final exam score
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Grade Modal */}
      <Modal isOpen={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Add Grade" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGrade}>Add Grade</Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Assignment Name" value={newGrade.name}
            onChange={(e) => setNewGrade(p => ({ ...p, name: e.target.value }))} placeholder="Midterm Exam" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Points Earned" type="number" value={newGrade.earned}
              onChange={(e) => setNewGrade(p => ({ ...p, earned: e.target.value }))} placeholder="85" />
            <Input label="Points Possible" type="number" value={newGrade.possible}
              onChange={(e) => setNewGrade(p => ({ ...p, possible: e.target.value }))} placeholder="100" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Grades
