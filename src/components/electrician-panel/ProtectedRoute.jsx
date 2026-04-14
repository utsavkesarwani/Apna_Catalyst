import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Protects electrician panel routes — redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isElectrician } = useAuth()

  if (!isAuthenticated || !isElectrician) {
    return <Navigate to="/electrician/login" replace />
  }

  return children
}
