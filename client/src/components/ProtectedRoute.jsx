import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}
          >
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'serif' }}>栞</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
