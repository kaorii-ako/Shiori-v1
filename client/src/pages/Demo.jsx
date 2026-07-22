import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAssignmentsStore, useEventStore, useGradesStore, useNotesStore, useFlashcardsStore, useXPStore } from '../stores'
import { DEMO_COURSES, DEMO_ASSIGNMENTS, DEMO_EVENTS, DEMO_GRADES, DEMO_NOTES, DEMO_COURSE_WEIGHTS, DEMO_DECKS, DEMO_QUIZ_HISTORY, DEMO_LEADERBOARD } from '../utils/demoData'

export default function Demo() {
  const navigate = useNavigate()
  const { enterDemoMode, isAuthenticated, isDemo } = useAuthStore()
  const { setXP } = useXPStore()
  const { setAssignments, setCourses } = useAssignmentsStore()
  const { setEvents } = useEventStore()
  const { setCourseGrades, setCourseWeights } = useGradesStore()

  useEffect(() => {
    if (isAuthenticated && !isDemo) {
      navigate('/home', { replace: true })
      return
    }
    enterDemoMode()
    setCourses(DEMO_COURSES)
    setAssignments(DEMO_ASSIGNMENTS)
    setEvents(DEMO_EVENTS)
    Object.entries(DEMO_GRADES).forEach(([id, g]) => setCourseGrades(id, g))
    Object.entries(DEMO_COURSE_WEIGHTS).forEach(([id, w]) => setCourseWeights(id, w))
    useNotesStore.getState().replaceNotes(DEMO_NOTES)
    useFlashcardsStore.getState().replaceDecks(DEMO_DECKS)
    localStorage.setItem('shiori-quiz-history', JSON.stringify(DEMO_QUIZ_HISTORY))
    localStorage.setItem('shiori-leaderboard', JSON.stringify(DEMO_LEADERBOARD))
    setXP(620)
    navigate('/home', { replace: true })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0b0e14', color: '#e8ebf4', fontFamily: "'Space Grotesk', sans-serif", fontSize: 15,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="pulse" style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px',
          background: '#5a8bff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, color: '#0b0e14',
          boxShadow: '0 8px 32px rgba(90,139,255,0.4)',
        }}>栞</div>
        <div style={{ color: '#9aa1b5' }}>Setting up your demo…</div>
      </div>
    </div>
  )
}
