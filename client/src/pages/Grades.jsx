import { useState, useMemo } from 'react'
import { useGradesStore } from '../stores'
import { C } from '../utils/theme'

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
  const { semesters } = useGradesStore()
  const [finalWeight, setFinalWeight] = useState(30)
  const [desiredGrade, setDesiredGrade] = useState(90)
  const [currentPct, setCurrentPct] = useState(85)

  const allCourses = useMemo(() => (semesters || []).flatMap(s => s.courses || []), [semesters])

  const overallGPA = useMemo(() => {
    const gpas = allCourses.filter(c => c.gpa != null).map(c => c.gpa)
    if (!gpas.length) return null
    return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)
  }, [allCourses])

  const neededOnFinal = useMemo(() => {
    const w = finalWeight / 100
    const needed = (desiredGrade - currentPct * (1 - w)) / w
    return needed.toFixed(1)
  }, [finalWeight, desiredGrade, currentPct])

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        📊 Grades
      </h1>

      {/* GPA Overview */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
            CUMULATIVE GPA
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 52, fontWeight: 800,
            color: overallGPA ? (overallGPA >= 3.5 ? C.green : overallGPA >= 3.0 ? C.orange : C.pink) : C.textMuted,
            lineHeight: 1,
          }}>
            {overallGPA || '—'}
          </div>
        </div>
        <div style={{ height: 60, width: 1, background: C.border }} />
        <div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Tracking <strong style={{ color: C.text }}>{allCourses.length}</strong> courses</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Across <strong style={{ color: C.text }}>{(semesters || []).length}</strong> semesters
          </div>
        </div>
      </div>

      {/* Course cards */}
      {allCourses.length === 0 ? (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '40px 20px', textAlign: 'center', marginBottom: 24,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ color: C.textMuted, fontSize: 14 }}>No courses yet. Add grades to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14, marginBottom: 24,
        }}>
          {allCourses.map((course, i) => {
            const pct = course.percentage ?? course.grade ?? 0
            const letter = letterGrade(pct)
            const color = gradeColor(pct)
            return (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>
                    {course.name}
                  </div>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800,
                    color: color,
                  }}>{letter}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{pct}%{course.credits ? ` · ${course.credits} credits` : ''}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Grade predictor */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>
          🧮 Grade Predictor
        </h2>
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
              <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{label}</label>
              <input
                type="number" min={0} max={100}
                value={val}
                onChange={e => set(Number(e.target.value))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  background: C.bg, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif",
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{
          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>You need at least</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800,
            color: parseFloat(neededOnFinal) > 100 ? C.pink : parseFloat(neededOnFinal) < 60 ? C.green : C.blue,
          }}>{neededOnFinal}%</span>
          <span style={{ fontSize: 13, color: C.textMuted }}>on your final exam.</span>
          {parseFloat(neededOnFinal) > 100 && (
            <span style={{ fontSize: 12, color: C.pink, marginLeft: 8 }}>Not achievable — aim higher now!</span>
          )}
        </div>
      </div>
    </div>
  )
}
