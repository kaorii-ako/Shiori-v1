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
    // Real authenticated user (not demo) → send home
    if (isAuthenticated && !isDemo) {
      navigate('/home', { replace: true })
      return
    }
    // (Re-)initialize demo every time — handles page refresh where auth store
    // persisted isDemo:true but non-persistent stores (assignments, events) reset
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
      background: '#10141a', color: '#dfe2eb',
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 16,
    }}>
      Loading demo...
    </div>
  )
}
