import { useState, useMemo } from 'react'
import { BarChart3, Calculator } from 'lucide-react'
import { useGradesStore, useAssignmentsStore, pctToGPA } from '../stores'
import { C, fonts, tint, inputStyle } from '../utils/theme'
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui'

function letterGrade(pct) {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 60) return 'D'
  return 'F'
}

function gradeColor(pct) {
  if (pct >= 80) return C.green
  if (pct >= 70) return C.orange
  return C.pink
}

export default function Grades() {
  const { calculateCourseGrade, courseGrades } = useGradesStore()
  const { courses } = useAssignmentsStore()
  const [finalWeight, setFinalWeight] = useState(30)
  const [desiredGrade, setDesiredGrade] = useState(90)
  const [currentPct, setCurrentPct] = useState(85)

  const courseGradeData = useMemo(() => {
    return (courses || [])
      .map(c => {
        const result = calculateCourseGrade(c.id)
        if (!result) return null
        return { course: c, result }
      })
      .filter(Boolean)
  }, [courses, courseGrades, calculateCourseGrade])

  const overallGPA = useMemo(() => {
    if (!courseGradeData.length) return null
    let weightedSum = 0
    let totalCredits = 0
    courseGradeData.forEach(({ course, result }) => {
      const credits = course.credits || 3
      const pct = parseFloat(result.percentage)
      weightedSum += pctToGPA(pct) * credits
      totalCredits += credits
    })
    if (totalCredits === 0) return null
    return (weightedSum / totalCredits).toFixed(2)
  }, [courseGradeData])

  const neededOnFinal = useMemo(() => {
    const w = finalWeight / 100
    const needed = (desiredGrade - currentPct * (1 - w)) / w
    return needed.toFixed(1)
  }, [finalWeight, desiredGrade, currentPct])

  const gpaColor = overallGPA
    ? (parseFloat(overallGPA) >= 3.5 ? C.green : parseFloat(overallGPA) >= 3.0 ? C.orange : C.pink)
    : C.textMuted

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 920, margin: '0 auto' }}>
      <PageHeader
        icon={BarChart3}
        accent={C.green}
        title="Grades"
        subtitle="Track your GPA and predict your finals"
      />

      {/* GPA Overview */}
      <Card style={{
        padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        background: C.card,
        borderLeft: `3px solid ${gpaColor === C.textMuted ? C.blue : gpaColor}`,
      }}>
        <div>
          <div style={{
            fontSize: 11, color: C.textMuted, marginBottom: 6, fontFamily: fonts.heading,
            fontWeight: 700, letterSpacing: '0.1em',
          }}>
            CUMULATIVE GPA
          </div>
          <div style={{
            fontFamily: fonts.heading, fontSize: 54, fontWeight: 700,
            color: gpaColor, lineHeight: 1,
            textShadow: overallGPA ? `0 0 32px ${tint(gpaColor, 0.4)}` : 'none',
          }}>
            {overallGPA || '—'}
          </div>
        </div>
        <div style={{ height: 60, width: 1, background: C.border }} />
        <div>
          <div style={{ fontSize: 13, color: C.textMuted }}>
            Tracking <strong style={{ color: C.text }}>{courseGradeData.length}</strong> courses with grades
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Out of <strong style={{ color: C.text }}>{(courses || []).length}</strong> total courses
          </div>
        </div>
      </Card>

      {/* Course cards */}
      {courseGradeData.length === 0 ? (
        <Card style={{ marginBottom: 24, padding: 0 }}>
          <Empty
            icon={BarChart3}
            accent={C.green}
            title="No grades yet"
            description="Sync Google Classroom or add grades to your courses to see your GPA here."
          />
        </Card>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14, marginBottom: 24,
        }}>
          {courseGradeData.map(({ course, result }) => {
            const pct = parseFloat(result.percentage)
            const letter = letterGrade(pct)
            const color = gradeColor(pct)
            return (
              <div key={course.id} className="hover-lift" style={{
                background: C.card,
                border: `1px solid ${C.border}`, borderRadius: 14, padding: 18,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: C.text }}>
                    {course.name}
                  </div>
                  <span style={{
                    fontFamily: fonts.heading, fontSize: 21, fontWeight: 700,
                    color, textShadow: `0 0 16px ${tint(color, 0.4)}`,
                  }}>{letter}</span>
                </div>
                <div style={{ height: 5, background: tint(color, 0.12), borderRadius: 3, overflow: 'hidden', marginBottom: 9 }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {result.percentage}%{course.credits ? ` · ${course.credits} credits` : ''}
                  {result.isWeighted ? ' · weighted' : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Grade predictor */}
      <Card style={{ padding: 24 }}>
        <SectionTitle icon={Calculator} color={C.blue}>Grade Predictor</SectionTitle>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 18 }}>
          What grade do I need on the final exam?
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Current Grade (%)', val: currentPct, set: setCurrentPct },
            { label: 'Final Exam Weight (%)', val: finalWeight, set: setFinalWeight },
            { label: 'Desired Final Grade (%)', val: desiredGrade, set: setDesiredGrade },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>{label}</label>
              <input
                type="number" min={0} max={100}
                value={val}
                onChange={e => set(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: fonts.heading, fontWeight: 600 }}
                onFocus={e => { e.target.style.borderColor = C.blueDark }}
                onBlur={e => { e.target.style.borderColor = C.border }}
              />
            </div>
          ))}
        </div>
        <div style={{
          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>You need at least</span>
          <span style={{
            fontFamily: fonts.heading, fontSize: 28, fontWeight: 700,
            color: parseFloat(neededOnFinal) > 100 ? C.pink : parseFloat(neededOnFinal) < 60 ? C.green : C.blue,
          }}>{neededOnFinal}%</span>
          <span style={{ fontSize: 13, color: C.textMuted }}>on your final exam.</span>
          {parseFloat(neededOnFinal) > 100 && (
            <span style={{ fontSize: 12, color: C.pink, fontWeight: 700 }}>Not achievable — aim higher now!</span>
          )}
        </div>
      </Card>
    </div>
  )
}
