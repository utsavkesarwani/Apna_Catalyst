import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * OnboardingRoute
 * Wraps protected routes to enforce profile completion.
 * If the user needs onboarding (missing mobile or address), redirect to /onboarding.
 * Skips the check on the /onboarding page itself to avoid redirect loops.
 */
export default function OnboardingRoute({ children }) {
  const { isAuthenticated, needsOnboarding } = useAuth()
  const location = useLocation()

  // Don't redirect if not authenticated (let other guards handle that)
  if (!isAuthenticated) {
    return children
  }

  // Redirect to onboarding if profile is incomplete
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
