import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import Pro from './pages/Pro'
import ProSuccess from './pages/ProSuccess'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Assignments from './pages/Assignments'
import Calendar from './pages/Calendar'
import Grades from './pages/Grades'
import StudyPlans from './pages/StudyPlans'
import Notes from './pages/Notes'
import Flashcards from './pages/Flashcards'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Habits from './pages/Habits'
import FocusMode from './pages/FocusMode'
import Quiz from './pages/Quiz'
import Leaderboard from './pages/Leaderboard'
import SyllabusImport from './pages/SyllabusImport'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Demo from './pages/Demo'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="/pro/success" element={<ProSuccess />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/demo" element={<Demo />} />

          {/* Protected app — Layout renders Outlet for all children */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/study" element={<StudyPlans />} />
            <Route path="/study-plans" element={<StudyPlans />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/focus" element={<FocusMode />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/import" element={<SyllabusImport />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
