import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminLogin as adminLoginAPI } from '../../api/admin.api.js'

const TOKEN_KEY = 'apna_catalyst_token'
const USER_KEY = 'apna_catalyst_user'

/**
 * Protects super admin routes — redirects to login if not authenticated as admin/superadmin.
 * 
 * Also auto-upgrades stale demo tokens: if the user previously logged in via
 * "Quick Demo Access" (which sets a fake token), this component will try to
 * authenticate with the real backend on mount and replace the demo token with
 * a valid JWT, so all admin write operations work correctly.
 */
export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, token, adminLogin, logout } = useAuth()
  const [upgrading, setUpgrading] = useState(false)

  const isDemoToken = token && token.startsWith('demo_token_')

  // Auto-upgrade demo tokens to real JWT when backend is available
  useEffect(() => {
    if (!isDemoToken) return

    let cancelled = false
    const upgradeToken = async () => {
      setUpgrading(true)
      try {
        // Try to authenticate with the seeded admin credentials
        const response = await adminLoginAPI({ email: 'admin@apnacatalyst.com', password: 'admin123' })
        if (!cancelled && response?.token) {
          // Persist the real token immediately
          localStorage.setItem(TOKEN_KEY, response.token)
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
          // Reload to pick up the real token across the entire app
          window.location.reload()
        }
      } catch {
        // Backend is still down — continue in demo mode (read-only)
      } finally {
        if (!cancelled) setUpgrading(false)
      }
    }

    upgradeToken()
    return () => { cancelled = true }
  }, [isDemoToken])

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/superadmin/login" replace />
  }

  if (upgrading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-400 text-sm">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return children
}
