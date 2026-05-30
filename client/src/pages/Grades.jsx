import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Calculator, TrendingUp, Award, Plus, Trash2,
  AlertCircle, Sparkles, BookOpen, Share2, Settings2,
  ChevronDown, ChevronUp, Download, X,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import ProgressBar from '../components/ProgressBar'
import { useGradesStore, useAssignmentsStore } from '../stores'

const GRADE_SCALE = [
  { min: 93, letter: 'A',  gpa: 4.0, color: '#4dff91' },
  { min: 90, letter: 'A-', gpa: 3.7, color: '#4dff91' },
  { min: 87, letter: 'B+', gpa: 3.3, color: '#afc6ff' },
  { min: 83, letter: 'B',  gpa: 3.0, color: '#afc6ff' },
  { min: 80, letter: 'B-', gpa: 2.7, color: '#afc6ff' },
  { min: 77, letter: 'C+', gpa: 2.3, color: '#ffd6a0' },
  { min: 73, letter: 'C',  gpa: 2.0, color: '#ffd6a0' },
  { min: 70, letter: 'C-', gpa: 1.7, color: '#ffd6a0' },
  { min: 67, letter: 'D+', gpa: 1.3, color: '#ff8f6b' },
  { min: 63, letter: 'D',  gpa: 1.0, color: '#ff8f6b' },
  { min: 60, letter: 'D-', gpa: 0.7, color: '#ff8f6b' },
  { min: 0,  letter: 'F',  gpa: 0.0, color: '#ff4d6a' },
]

const getGradeInfo = (pct) => GRADE_SCALE.find(g => pct >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1]

const CourseCard = ({ course, pct, gradeInfo, isSelected, onClick, completed, total }) => (
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
        {pct !== null ? `${pct}%` : '—'} {pct !== null ? gradeInfo.letter : ''}
      </span>
    </div>
    {total > 0 && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${Math.round((completed / total) * 100)}%`, background: '#4dff91', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: '#8c90a0', whiteSpace: 'nowrap' }}>
          {completed}/{total}
        </span>
      </div>
    )}
    {pct !== null && (
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: course.color, borderRadius: 2 }} />
      </div>
    )}
  </motion.div>
)

const generateGPACard = (courses, overallGPA, userName) => {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 520
  const ctx = canvas.getContext('2d')

  // Background
  const bg = ctx.createLinearGradient(0, 0, 900, 520)
  bg.addColorStop(0, '#0d1117')
  bg.addColorStop(1, '#151b27')
  ctx.fillStyle = bg
  ctx.roundRect(0, 0, 900, 520, 24)
  ctx.fill()

  // Decorative circles
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#c44dff'
  ctx.beginPath(); ctx.arc(760, 80, 180, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#528dff'
  ctx.beginPath(); ctx.arc(120, 440, 140, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  // Border
  ctx.strokeStyle = 'rgba(196,77,255,0.3)'
  ctx.lineWidth = 2
  ctx.roundRect(2, 2, 896, 516, 23)
  ctx.stroke()

  // Title
  ctx.fillStyle = '#afc6ff'
  ctx.font = 'bold 13px monospace'
  ctx.fillText('栞 SHIORI', 48, 56)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '12px monospace'
  ctx.fillText('GPA REPORT CARD', 48, 76)

  // User name
  if (userName) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '14px monospace'
    ctx.fillText(userName.toUpperCase(), 48, 108)
  }

  // Big GPA
  const gpaColor = parseFloat(overallGPA) >= 3.7 ? '#4dff91'
    : parseFloat(overallGPA) >= 3.0 ? '#afc6ff'
    : parseFloat(overallGPA) >= 2.0 ? '#ffd6a0' : '#ff8f6b'

  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.roundRect(48, 128, 260, 120, 16)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px monospace'
  ctx.fillText('CUMULATIVE GPA', 68, 156)

  ctx.fillStyle = gpaColor
  ctx.font = 'bold 64px monospace'
  ctx.fillText(overallGPA, 68, 228)

  // Courses (right column)
  const courseColors = ['#ff6b9d', '#afc6ff', '#4dff91', '#ffd6a0', '#e5b5ff']
  const startX = 380
  let y = 148
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px monospace'
  ctx.fillText('COURSE BREAKDOWN', startX, y - 8)

  courses.slice(0, 5).forEach((c, i) => {
    const barW = 320
    const pct = c.pct || 0
    const color = courseColors[i % courseColors.length]

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.roundRect(startX, y, barW, 48, 8)
    ctx.fill()

    ctx.fillStyle = color + '22'
    ctx.roundRect(startX, y, Math.max(barW * pct / 100, 8), 48, 8)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '13px monospace'
    ctx.fillText(c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name, startX + 12, y + 20)

    ctx.fillStyle = color
    ctx.font = 'bold 12px monospace'
    const label = c.pct !== null ? `${c.pct}% ${c.gradeInfo.letter}` : '—'
    ctx.fillText(label, startX + 12, y + 38)

    y += 58
  })

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '11px monospace'
  ctx.fillText('shiori-v1.vercel.app  ·  Your AI Study Companion', 48, 490)

  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const dateW = ctx.measureText(date).width
  ctx.fillText(date, 900 - 48 - dateW, 490)

  return canvas
}

const WeightEditor = ({ courseId, weights, onSave, onClose }) => {
  const DEFAULT_CATS = [
    { id: `cat-${Date.now()}-1`, name: 'Homework', weight: 30 },
    { id: `cat-${Date.now()}-2`, name: 'Midterm', weight: 30 },
    { id: `cat-${Date.now()}-3`, name: 'Final Exam', weight: 40 },
  ]
  const [cats, setCats] = useState(weights?.length ? weights : DEFAULT_CATS)
  const totalWeight = cats.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0)
  const isValid = Math.abs(totalWeight - 100) < 0.01

  const addCat = () => setCats(p => [...p, { id: `cat-${Date.now()}`, name: '', weight: 0 }])
  const removeCat = (id) => setCats(p => p.filter(c => c.id !== id))
  const updateCat = (id, field, val) => setCats(p => p.map(c => c.id === id ? { ...c, [field]: val } : c))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontFamily: 'VT323', fontSize: 16, color: '#8c90a0' }}>
        Set category weights. Total must equal 100%.
      </p>
      {cats.map(cat => (
        <div key={cat.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={cat.name}
            onChange={e => updateCat(cat.id, 'name', e.target.value)}
            placeholder="Category name"
            style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
              color: '#dfe2eb', fontFamily: 'VT323', fontSize: 16 }}
          />
          <input
            type="number" min="0" max="100"
            value={cat.weight}
            onChange={e => updateCat(cat.id, 'weight', parseFloat(e.target.value) || 0)}
            style={{ width: 72, padding: '8px 10px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
              color: '#dfe2eb', fontFamily: '"Press Start 2P"', fontSize: 11, textAlign: 'center' }}
          />
          <span style={{ fontFamily: 'VT323', fontSize: 16, color: '#8c90a0', width: 16 }}>%</span>
          <button onClick={() => removeCat(cat.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={14} color="#ff4d6a" />
          </button>
        </div>
      ))}
      <button onClick={addCat}
        style={{ padding: '8px', background: 'rgba(175,198,255,0.08)',
          border: '1px dashed rgba(175,198,255,0.3)', borderRadius: 6, cursor: 'pointer',
          fontFamily: 'VT323', fontSize: 16, color: '#afc6ff' }}>
        + Add Category
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', background: isValid ? 'rgba(77,255,145,0.06)' : 'rgba(255,77,106,0.06)',
        border: `1px solid ${isValid ? 'rgba(77,255,145,0.3)' : 'rgba(255,77,106,0.3)'}`, borderRadius: 6 }}>
        <span style={{ fontFamily: 'VT323', fontSize: 16, color: isValid ? '#4dff91' : '#ff4d6a' }}>
          Total: {totalWeight.toFixed(0)}%
        </span>
        {!isValid && (
          <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#ff8f6b' }}>
            Must equal 100%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!isValid} onClick={() => isValid && onSave(cats)}>Save Weights</Button>
      </div>
    </div>
  )
}

const Grades = () => {
  const {
    courseGrades, addGrade, removeGrade, calculateCourseGrade,
    courseWeights, setCourseWeights,
  } = useGradesStore()
  const { courses, assignments } = useAssignmentsStore()

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [newGrade, setNewGrade] = useState({ name: '', earned: '', possible: '', categoryId: '' })

  const [predTarget, setPredTarget] = useState('')
  const [predFinalWeight, setPredFinalWeight] = useState('30')
  const [predResult, setPredResult] = useState(null)

  const courseSummaries = useMemo(() => {
    if (!courses?.length) return []
    return courses.map(c => {
      const cg = calculateCourseGrade(c.id)
      // Count assignment completion for this course
      const courseAssignments = assignments.filter(a => a.courseId === c.id)
      const completed = courseAssignments.filter(a => a.status === 'completed' || a.status === 'graded').length
      if (!cg) return { ...c, pct: null, gradeInfo: { letter: '—', gpa: 0, color: '#606080' }, completed, total: courseAssignments.length }
      const pct = parseFloat(cg.percentage)
      return { ...c, pct, gradeInfo: getGradeInfo(pct), completed, total: courseAssignments.length }
    })
  }, [courses, courseGrades, courseWeights, assignments])

  const overallGPA = useMemo(() => {
    const withGrades = courseSummaries.filter(c => c.pct !== null)
    if (!withGrades.length) return null
    const sum = withGrades.reduce((acc, c) => acc + c.gradeInfo.gpa, 0)
    return (sum / withGrades.length).toFixed(2)
  }, [courseSummaries])

  const handleAddGrade = () => {
    if (!selectedCourse || !newGrade.name || !newGrade.earned || !newGrade.possible) return
    const entry = {
      name: newGrade.name,
      pointsEarned: parseFloat(newGrade.earned),
      pointsPossible: parseFloat(newGrade.possible),
    }
    if (newGrade.categoryId) entry.categoryId = newGrade.categoryId
    addGrade(selectedCourse.id, `${Date.now()}`, entry)
    setNewGrade({ name: '', earned: '', possible: '', categoryId: '' })
    setGradeModalOpen(false)
  }

  const calculatePrediction = () => {
    if (!selectedCourse || !predTarget) return
    const courseGrade = calculateCourseGrade(selectedCourse.id)
    if (!courseGrade) return
    const currentPct = parseFloat(courseGrade.percentage)
    const targetPct = parseFloat(predTarget)
    const finalWeight = parseFloat(predFinalWeight) / 100
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

  const handleShareGPA = () => {
    if (!overallGPA) return
    const canvas = generateGPACard(
      courseSummaries,
      overallGPA,
      null
    )
    const link = document.createElement('a')
    link.download = `shiori-gpa-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const course = selectedCourse
  const grades = course ? courseGrades[course.id] : {}
  const courseGrade = course ? calculateCourseGrade(course.id) : null
  const gradeEntries = grades ? Object.entries(grades) : []
  const overallGrade = courseGrade?.percentage || 0
  const gradeInfo = getGradeInfo(parseFloat(overallGrade))
  const weights = course ? (courseWeights[course.id] || []) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Press Start 2P"', fontSize: 16,
            background: 'linear-gradient(135deg, #afc6ff, #e5b5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GRADES
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: 18, color: '#8c90a0', marginTop: 4 }}>
            Track grades, weighted categories &amp; predict your finals
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {overallGPA && (
            <>
              <div style={{ textAlign: 'center', padding: '10px 20px',
                background: 'rgba(77,255,145,0.08)', border: '2px solid rgba(77,255,145,0.3)',
                borderRadius: 8 }}>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', marginBottom: 4 }}>GPA</p>
                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 24, color: '#4dff91' }}>{overallGPA}</p>
              </div>
              <Button
                variant="secondary"
                icon={Share2}
                size="sm"
                onClick={handleShareGPA}
                style={{ borderColor: '#e5b5ff', color: '#e5b5ff' }}
              >
                SHARE
              </Button>
            </>
          )}
        </div>
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
                  completed={c.completed} total={c.total}
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
                      {courseGrade?.isWeighted && (
                        <Badge variant="purple" style={{ fontSize: 8 }}>WEIGHTED</Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="sm" variant="secondary" icon={Settings2}
                        onClick={() => setWeightModalOpen(true)}
                        style={{ borderColor: '#ffd6a0', color: '#ffd6a0' }}>
                        WEIGHTS
                      </Button>
                      <Button size="sm" variant="secondary" icon={Plus} onClick={() => setGradeModalOpen(true)}>
                        ADD GRADE
                      </Button>
                    </div>
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

                  {/* Progress */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'VT323', fontSize: 15, color: '#8c90a0' }}>Overall Progress</span>
                      <span style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: gradeInfo.color }}>{overallGrade}%</span>
                    </div>
                    <ProgressBar value={parseFloat(overallGrade)} max={100} size="lg" />
                  </div>

                  {/* Weight categories display */}
                  {weights.length > 0 && (
                    <div style={{ marginBottom: 20, padding: '12px 14px',
                      background: 'rgba(255,214,160,0.06)', border: '1px solid rgba(255,214,160,0.2)', borderRadius: 8 }}>
                      <p style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#ffd6a0', marginBottom: 10 }}>WEIGHT CATEGORIES</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {weights.map(w => {
                          const catGrades = gradeEntries.filter(([, g]) => g.categoryId === w.id)
                          const hasGrades = catGrades.length > 0
                          return (
                            <div key={w.id} style={{ padding: '4px 10px', borderRadius: 20,
                              background: hasGrades ? 'rgba(77,255,145,0.08)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${hasGrades ? 'rgba(77,255,145,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                              <span style={{ fontFamily: 'VT323', fontSize: 15,
                                color: hasGrades ? '#4dff91' : '#8c90a0' }}>
                                {w.name} <strong>{w.weight}%</strong>
                                {hasGrades && ` (${catGrades.length})`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grade list */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: '#8c90a0' }}>ASSIGNMENTS</h3>
                    <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#606080' }}>
                      {gradeEntries.length} grade{gradeEntries.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {gradeEntries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {gradeEntries.map(([id, grade]) => {
                        const pct = (grade.pointsEarned / grade.pointsPossible) * 100
                        const gi = getGradeInfo(pct)
                        const catName = weights.find(w => w.id === grade.categoryId)?.name
                        return (
                          <motion.div key={id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                                  {catName && <span style={{ color: '#ffd6a0' }}> · {catName}</span>}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: gi.color }}>{pct.toFixed(1)}%</p>
                                <span style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080' }}>{gi.letter}</span>
                              </div>
                              <button
                                onClick={() => removeGrade(course.id, id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer',
                                  padding: 4, opacity: 0.5, transition: 'opacity 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                              >
                                <Trash2 size={14} color="#ff4d6a" />
                              </button>
                            </div>
                          </motion.div>
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
                          fontFamily: '"Press Start 2P"', fontSize: 12, boxSizing: 'border-box' }}
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
                          fontFamily: '"Press Start 2P"', fontSize: 12, boxSizing: 'border-box' }}
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
                          ? `You've already secured ${predTarget}%! Just show up.`
                          : parseFloat(predResult.needed) > 100
                          ? `Not possible to reach ${predTarget}% — maximize all remaining assignments.`
                          : predResult.easy
                          ? `You're on track! A score near your current average gets you there.`
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
                    Pick a course from the left to view grades, set category weights, and predict your final exam score
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
          {weights.length > 0 && (
            <div>
              <label style={{ fontFamily: '"Press Start 2P"', fontSize: 8, color: '#606080', display: 'block', marginBottom: 8 }}>
                CATEGORY (OPTIONAL)
              </label>
              <select
                value={newGrade.categoryId}
                onChange={e => setNewGrade(p => ({ ...p, categoryId: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                  color: '#dfe2eb', fontFamily: 'VT323', fontSize: 16, cursor: 'pointer' }}>
                <option value="">No category</option>
                {weights.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.weight}%)</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Weight Categories Modal */}
      {course && (
        <Modal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)}
          title={`Weight Categories — ${course.name}`} size="sm">
          <WeightEditor
            courseId={course.id}
            weights={courseWeights[course.id]}
            onSave={(cats) => {
              setCourseWeights(course.id, cats)
              setWeightModalOpen(false)
            }}
            onClose={() => setWeightModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Grades
