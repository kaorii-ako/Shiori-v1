import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
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
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/pro" element={<Pro />} />
        <Route path="/pro/success" element={<ProSuccess />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
