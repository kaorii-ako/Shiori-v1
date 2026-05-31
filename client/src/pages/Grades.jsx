import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Award, Plus, Trash2,
  Sparkles, Share2, Settings2,
  ChevronDown, ChevronUp, X,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useGradesStore, useAssignmentsStore } from '../stores'

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.95)',
  surfaceBright: 'rgba(20,25,34,0.9)',
  border: 'rgba(50,55,70,0.4)',
  borderBright: 'rgba(80,90,110,0.5)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
  cyan: '#4daaff',
}

const card = {
  background: 'rgba(13,17,24,0.95)',
  border: '1px solid rgba(50,55,70,0.4)',
  borderRadius: 12,
  padding: '20px 24px',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: '#dfe2eb', outline: 'none',
  fontFamily: "'Manrope', sans-serif", fontSize: 14,
  boxSizing: 'border-box',
}

const labelStyle = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600, fontSize: 11,
  letterSpacing: '0.08em', color: T.muted,
  display: 'block', marginBottom: 6,
}

// ── Grade scale ──────────────────────────────────────────────────────────────
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

const getGradeInfo = (pct) =>
  GRADE_SCALE.find(g => pct >= g.min) || GRADE_SCALE[GRADE_SCALE.length - 1]

// ── GPA share card (canvas) ──────────────────────────────────────────────────
const generateGPACard = (courses, overallGPA, userName) => {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 520
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 900, 520)
  bg.addColorStop(0, '#0d1117')
  bg.addColorStop(1, '#151b27')
  ctx.fillStyle = bg
  ctx.roundRect(0, 0, 900, 520, 24)
  ctx.fill()

  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#c44dff'
  ctx.beginPath(); ctx.arc(760, 80, 180, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#528dff'
  ctx.beginPath(); ctx.arc(120, 440, 140, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(196,77,255,0.3)'
  ctx.lineWidth = 2
  ctx.roundRect(2, 2, 896, 516, 23)
  ctx.stroke()

  ctx.fillStyle = '#afc6ff'
  ctx.font = 'bold 13px monospace'
  ctx.fillText('栞 SHIORI', 48, 56)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '12px monospace'
  ctx.fillText('GPA REPORT CARD', 48, 76)

  if (userName) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '14px monospace'
    ctx.fillText(userName.toUpperCase(), 48, 108)
  }

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

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '11px monospace'
  ctx.fillText('shiorii.tech  ·  Your AI Study Companion', 48, 490)

  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const dateW = ctx.measureText(date).width
  ctx.fillText(date, 900 - 48 - dateW, 490)

  return canvas
}

// ── Weight Editor ────────────────────────────────────────────────────────────
const WeightEditor = ({ weights, onSave, onClose }) => {
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
  const updateCat = (id, field, val) =>
    setCats(p => p.map(c => c.id === id ? { ...c, [field]: val } : c))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.muted }}>
        Set category weights. Total must equal 100%.
      </p>
      {cats.map(cat => (
        <div key={cat.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={cat.name}
            onChange={e => updateCat(cat.id, 'name', e.target.value)}
            placeholder="Category name"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number" min="0" max="100"
            value={cat.weight}
            onChange={e => updateCat(cat.id, 'weight', parseFloat(e.target.value) || 0)}
            style={{ ...inputStyle, width: 72, textAlign: 'center' }}
          />
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, width: 16 }}>%</span>
          <button onClick={() => removeCat(cat.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={14} color={T.pink} />
          </button>
        </div>
      ))}
      <button
        onClick={addCat}
        style={{ padding: '8px', background: 'rgba(175,198,255,0.08)',
          border: '1px dashed rgba(175,198,255,0.3)', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: T.blue }}>
        + Add Category
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px',
        background: isValid ? 'rgba(77,255,145,0.06)' : 'rgba(255,107,157,0.06)',
        border: `1px solid ${isValid ? 'rgba(77,255,145,0.3)' : 'rgba(255,107,157,0.3)'}`,
        borderRadius: 8 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14,
          color: isValid ? T.green : T.pink }}>
          Total: {totalWeight.toFixed(0)}%
        </span>
        {!isValid && (
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.orange }}>
            Must equal 100%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(50,55,70,0.4)', color: T.text,
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          disabled={!isValid}
          onClick={() => isValid && onSave(cats)}
          style={{ padding: '9px 20px', borderRadius: 8,
            background: isValid ? 'linear-gradient(135deg, #c44dff, #528dff)' : 'rgba(255,255,255,0.05)',
            color: isValid ? '#fff' : T.faint, border: 'none',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
            cursor: isValid ? 'pointer' : 'not-allowed' }}>
          Save Weights
        </button>
      </div>
    </div>
  )
}

// ── Per-course card ──────────────────────────────────────────────────────────
const CourseGradeCard = ({
  idx, course, pct, gradeInfo, gradeEntries, weights,
  onAddGrade, onRemoveGrade, onManageWeights,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [predTarget, setPredTarget] = useState('')
  const [predFinalWeight, setPredFinalWeight] = useState('30')
  const [predResult, setPredResult] = useState(null)

  const calculatePrediction = () => {
    if (pct === null || !predTarget) return
    const targetPct = parseFloat(predTarget)
    const finalWeight = parseFloat(predFinalWeight) / 100
    const needed = (targetPct - (1 - finalWeight) * pct) / finalWeight
    setPredResult({
      current: pct.toFixed(1),
      target: targetPct,
      finalWeight: parseFloat(predFinalWeight),
      needed: needed.toFixed(1),
      possible: needed <= 100,
      easy: needed <= pct,
    })
  }

  const accentBg = gradeInfo.color + '18'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* ── Header: name + actions ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: course.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15,
              color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {course.name}
            </span>
          </div>
          {course.code && (
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
              letterSpacing: '0.08em', color: T.muted, paddingLeft: 16, display: 'block' }}>
              {course.code}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={onManageWeights}
            title="Manage weight categories"
            style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
              border: `1px solid rgba(255,214,160,0.3)`, color: T.orange,
              cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Settings2 size={13} />
          </button>
          <button
            onClick={onAddGrade}
            style={{ padding: '6px 12px', borderRadius: 8,
              background: 'linear-gradient(135deg, #c44dff, #528dff)',
              color: '#fff', border: 'none',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* ── Grade display ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 38,
              color: gradeInfo.color, lineHeight: 1 }}>
              {pct !== null ? `${pct}%` : '—'}
            </span>
            {pct !== null && (
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 6,
                background: accentBg, color: gradeInfo.color,
                border: `1px solid ${gradeInfo.color}40` }}>
                {gradeInfo.letter}
              </span>
            )}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${pct !== null ? Math.min(pct, 100) : 0}%`,
              background: gradeInfo.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 18px',
          background: accentBg, borderRadius: 10,
          border: `1px solid ${gradeInfo.color}28`, flexShrink: 0 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24,
            color: gradeInfo.color, lineHeight: 1 }}>{gradeInfo.gpa.toFixed(1)}</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 10,
            letterSpacing: '0.08em', color: T.muted, marginTop: 5 }}>GPA</p>
        </div>
      </div>

      {/* ── Final Exam Predictor ── */}
      <div style={{ padding: '12px 14px', borderRadius: 10,
        background: 'rgba(196,77,255,0.05)', border: '1px solid rgba(196,77,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Sparkles size={12} color={T.purpleVibrant} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
            letterSpacing: '0.08em', color: T.purple }}>FINAL PREDICTOR</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, marginBottom: 4 }}>TARGET %</label>
            <input
              type="number" min="0" max="100" placeholder="90"
              value={predTarget}
              onChange={e => { setPredTarget(e.target.value); setPredResult(null) }}
              style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }}
            />
          </div>
          <div style={{ width: 72 }}>
            <label style={{ ...labelStyle, marginBottom: 4 }}>WEIGHT %</label>
            <input
              type="number" min="1" max="100"
              value={predFinalWeight}
              onChange={e => { setPredFinalWeight(e.target.value); setPredResult(null) }}
              style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }}
            />
          </div>
          <button
            onClick={calculatePrediction}
            disabled={pct === null}
            style={{ padding: '8px 14px', borderRadius: 8, whiteSpace: 'nowrap',
              background: pct !== null ? 'rgba(196,77,255,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${pct !== null ? 'rgba(196,77,255,0.4)' : 'rgba(50,55,70,0.4)'}`,
              color: pct !== null ? T.purpleVibrant : T.faint,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
              cursor: pct !== null ? 'pointer' : 'not-allowed' }}>
            Calc
          </button>
        </div>

        <AnimatePresence>
          {predResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8,
                background: predResult.possible ? 'rgba(77,255,145,0.05)' : 'rgba(255,107,157,0.05)',
                border: `1px solid ${predResult.possible ? 'rgba(77,255,145,0.25)' : 'rgba(255,107,157,0.25)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted }}>
                  Need on final
                </span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20,
                  color: !predResult.possible ? T.pink : predResult.easy ? T.green : T.orange }}>
                  {parseFloat(predResult.needed) > 100 ? '100%+' : parseFloat(predResult.needed) < 0 ? 'Done!' : `${predResult.needed}%`}
                </span>
              </div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted, marginTop: 5 }}>
                {parseFloat(predResult.needed) < 0
                  ? `Already secured ${predResult.target}% — just show up!`
                  : parseFloat(predResult.needed) > 100
                  ? `Not possible to reach ${predResult.target}%.`
                  : predResult.easy
                  ? `On track — near your avg of ${predResult.current}%.`
                  : `Push hard — current avg ${predResult.current}%.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Grade entries (collapsible) ── */}
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px 0',
            borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
            letterSpacing: '0.08em', color: T.muted }}>
            GRADES ({gradeEntries.length})
          </span>
          {expanded
            ? <ChevronUp size={14} color={T.muted} />
            : <ChevronDown size={14} color={T.muted} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              key="entries"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              {gradeEntries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10 }}>
                  {gradeEntries.map(([id, grade], entryIdx) => {
                    const entryPct = (grade.pointsEarned / grade.pointsPossible) * 100
                    const gi = getGradeInfo(entryPct)
                    const catName = weights.find(w => w.id === grade.categoryId)?.name
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: entryIdx * 0.04 }}
                        style={{ display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', padding: '9px 12px',
                          borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(50,55,70,0.3)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.text,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {grade.name}
                          </p>
                          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>
                            {grade.pointsEarned} / {grade.pointsPossible} pts
                            {catName && <span style={{ color: T.orange }}> · {catName}</span>}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                            fontSize: 14, color: gi.color }}>
                            {entryPct.toFixed(1)}%
                          </span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
                            fontSize: 10, letterSpacing: '0.08em', color: gi.color,
                            padding: '2px 6px', borderRadius: 4,
                            background: gi.color + '15', border: `1px solid ${gi.color}30` }}>
                            {gi.letter}
                          </span>
                          <button
                            onClick={() => onRemoveGrade(id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer',
                              padding: 4, opacity: 0.45, transition: 'opacity 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0.45}>
                            <Trash2 size={13} color={T.pink} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: T.faint,
                  textAlign: 'center', padding: '14px 0' }}>
                  No grades yet — add your first.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Grades page ─────────────────────────────────────────────────────────
const Grades = () => {
  const {
    courseGrades, addGrade, removeGrade, calculateCourseGrade,
    courseWeights, setCourseWeights,
  } = useGradesStore()
  const { courses } = useAssignmentsStore()

  const [addGradeFor, setAddGradeFor] = useState(null)
  const [weightFor, setWeightFor] = useState(null)
  const [newGrade, setNewGrade] = useState({ name: '', earned: '', possible: '', categoryId: '' })

  const courseSummaries = useMemo(() => {
    if (!courses?.length) return []
    return courses.map(c => {
      const cg = calculateCourseGrade(c.id)
      if (!cg) return { ...c, pct: null, gradeInfo: { letter: '—', gpa: 0, color: T.faint } }
      const pct = parseFloat(cg.percentage)
      return { ...c, pct, gradeInfo: getGradeInfo(pct) }
    })
  }, [courses, courseGrades, courseWeights])

  const overallGPA = useMemo(() => {
    const withGrades = courseSummaries.filter(c => c.pct !== null)
    if (!withGrades.length) return null
    const sum = withGrades.reduce((acc, c) => acc + c.gradeInfo.gpa, 0)
    return (sum / withGrades.length).toFixed(2)
  }, [courseSummaries])

  const overallPct = useMemo(() => {
    const withGrades = courseSummaries.filter(c => c.pct !== null)
    if (!withGrades.length) return null
    const sum = withGrades.reduce((acc, c) => acc + c.pct, 0)
    return (sum / withGrades.length).toFixed(1)
  }, [courseSummaries])

  const handleAddGrade = () => {
    if (!addGradeFor || !newGrade.name || !newGrade.earned || !newGrade.possible) return
    const entry = {
      name: newGrade.name,
      pointsEarned: parseFloat(newGrade.earned),
      pointsPossible: parseFloat(newGrade.possible),
    }
    if (newGrade.categoryId) entry.categoryId = newGrade.categoryId
    addGrade(addGradeFor.id, `${Date.now()}`, entry)
    setNewGrade({ name: '', earned: '', possible: '', categoryId: '' })
    setAddGradeFor(null)
  }

  const handleShareGPA = () => {
    if (!overallGPA) return
    const canvas = generateGPACard(courseSummaries, overallGPA, null)
    const link = document.createElement('a')
    link.download = `shiori-gpa-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const overallGradeInfo = overallPct ? getGradeInfo(parseFloat(overallPct)) : null
  const activeWeights = addGradeFor ? (courseWeights[addGradeFor.id] || []) : []
  const coursesWithGrades = courseSummaries.filter(c => c.pct !== null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, margin: 0,
            background: 'linear-gradient(135deg, #afc6ff, #e5b5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Grade Tracker
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.muted, marginTop: 5, marginBottom: 0 }}>
            Weighted categories &amp; final exam predictions
          </p>
        </div>

        {overallGPA && (
          <button
            onClick={handleShareGPA}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(50,55,70,0.4)', color: T.purple,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={14} /> Share GPA
          </button>
        )}
      </motion.div>

      {/* ── GPA summary card ── */}
      {overallGPA && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          style={{ ...card, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

          {/* Big GPA number + letter */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 60,
              color: overallGradeInfo?.color || T.blue, lineHeight: 1 }}>
              {overallGPA}
            </span>
            <div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: '0.08em', color: T.muted, margin: 0, marginBottom: 4 }}>GPA</p>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20,
                color: overallGradeInfo?.color || T.blue }}>
                {overallGradeInfo?.letter}
              </span>
            </div>
          </div>

          <div style={{ width: 1, height: 56, background: T.border, flexShrink: 0 }} />

          {/* Overall % + progress bar */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: '0.08em', color: T.muted }}>OVERALL AVERAGE</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22,
                color: overallGradeInfo?.color || T.blue }}>
                {overallPct}%
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(parseFloat(overallPct), 100)}%`,
                background: `linear-gradient(90deg, ${(overallGradeInfo?.color || T.blue)}88, ${overallGradeInfo?.color || T.blue})`,
                borderRadius: 3, transition: 'width 0.8s ease',
              }} />
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: T.muted, marginTop: 8, marginBottom: 0 }}>
              Across {coursesWithGrades.length} course{coursesWithGrades.length !== 1 ? 's' : ''} with recorded grades
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Course cards grid ── */}
      {courseSummaries.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {courseSummaries.map((course, idx) => {
            const grades = courseGrades[course.id] || {}
            const entries = Object.entries(grades)
            const ws = courseWeights[course.id] || []
            return (
              <CourseGradeCard
                key={course.id}
                idx={idx}
                course={course}
                pct={course.pct}
                gradeInfo={course.gradeInfo}
                gradeEntries={entries}
                weights={ws}
                onAddGrade={() => setAddGradeFor(course)}
                onRemoveGrade={(gradeId) => removeGrade(course.id, gradeId)}
                onManageWeights={() => setWeightFor(course)}
              />
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ ...card, textAlign: 'center', padding: '60px 24px' }}>
          <Target size={40} style={{ margin: '0 auto 16px', color: T.faint, display: 'block' }} />
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16,
            color: T.muted, marginBottom: 8 }}>
            No courses yet
          </p>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: T.faint, margin: 0 }}>
            Add courses in the Assignments page to start tracking your grades.
          </p>
        </motion.div>
      )}

      {/* ── Add Grade Modal ── */}
      <Modal
        isOpen={!!addGradeFor}
        onClose={() => { setAddGradeFor(null); setNewGrade({ name: '', earned: '', possible: '', categoryId: '' }) }}
        title={addGradeFor ? `Add Grade — ${addGradeFor.name}` : 'Add Grade'}
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setAddGradeFor(null); setNewGrade({ name: '', earned: '', possible: '', categoryId: '' }) }}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(50,55,70,0.4)', color: T.text,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleAddGrade}
              style={{ padding: '9px 20px', borderRadius: 8,
                background: 'linear-gradient(135deg, #c44dff, #528dff)',
                color: '#fff', border: 'none',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Add Grade
            </button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>ASSIGNMENT NAME</label>
            <input
              value={newGrade.name}
              onChange={e => setNewGrade(p => ({ ...p, name: e.target.value }))}
              placeholder="Midterm Exam"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>POINTS EARNED</label>
              <input
                type="number"
                value={newGrade.earned}
                onChange={e => setNewGrade(p => ({ ...p, earned: e.target.value }))}
                placeholder="85"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>POINTS POSSIBLE</label>
              <input
                type="number"
                value={newGrade.possible}
                onChange={e => setNewGrade(p => ({ ...p, possible: e.target.value }))}
                placeholder="100"
                style={inputStyle}
              />
            </div>
          </div>
          {activeWeights.length > 0 && (
            <div>
              <label style={labelStyle}>CATEGORY (OPTIONAL)</label>
              <select
                value={newGrade.categoryId}
                onChange={e => setNewGrade(p => ({ ...p, categoryId: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">No category</option>
                {activeWeights.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.weight}%)</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Weight Categories Modal ── */}
      {weightFor && (
        <Modal
          isOpen={!!weightFor}
          onClose={() => setWeightFor(null)}
          title={`Weight Categories — ${weightFor.name}`}
          size="sm">
          <WeightEditor
            weights={courseWeights[weightFor.id]}
            onSave={cats => {
              setCourseWeights(weightFor.id, cats)
              setWeightFor(null)
            }}
            onClose={() => setWeightFor(null)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Grades
