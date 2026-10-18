import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useUser()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
