import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Protects user-only routes
 * Redirects to /auth if not logged in
 */
export default function UserProtectedRoute({ children }) {
  const { isAuthenticated, isUser, isAdmin } = useAuth()
  const location = useLocation()

  // Allow both users and admins to view user profile (admins can impersonate or troubleshoot)
  if (!isAuthenticated || (!isUser && !isAdmin)) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  return children
}
