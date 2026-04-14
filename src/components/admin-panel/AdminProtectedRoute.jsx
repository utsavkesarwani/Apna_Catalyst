import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Protects super admin routes — redirects to login if not authenticated as admin/superadmin
 */
export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/superadmin/login" replace />
  }

  return children
}
