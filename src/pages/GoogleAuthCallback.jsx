import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/user.api'

/**
 * GoogleAuthCallback
 * Landing page after Google OAuth redirect from the server.
 * Extracts the JWT token + user from URL params, stores in context/localStorage,
 * fetches the full profile, then redirects based on onboarding status.
 */
export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setGoogleUser, updateUser } = useAuth()
  const [status, setStatus] = useState('processing') // processing | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    // Handle OAuth error redirect
    if (error) {
      const messages = {
        google_auth_failed: 'Google sign-in was cancelled or failed. Please try again.',
        facebook_auth_failed: 'Facebook sign-in was cancelled or failed. Please try again.',
        server_error: 'A server error occurred. Please try again.',
      }
      setErrorMsg(messages[error] || 'Authentication failed. Please try again.')
      setStatus('error')
      setTimeout(() => navigate('/auth', { replace: true }), 3000)
      return
    }

    if (!token || !userParam) {
      setErrorMsg('Invalid authentication response. Please try again.')
      setStatus('error')
      setTimeout(() => navigate('/auth', { replace: true }), 3000)
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam))

      // Store in localStorage (matches existing auth flow)
      localStorage.setItem('apna_catalyst_token', token)
      localStorage.setItem('apna_catalyst_user', JSON.stringify(user))

      // Update AuthContext state
      setGoogleUser(token, user)

      setStatus('success')

      // Clear sensitive data from URL immediately
      window.history.replaceState({}, document.title, '/auth/google/success')

      // Fetch full profile to get detailedAddress and check onboarding
      getMe()
        .then((response) => {
          const fullUser = { ...response.user, role: response.user.role || 'user' }
          // Update context + localStorage with full user data
          updateUser(fullUser)
          localStorage.setItem('apna_catalyst_user', JSON.stringify(fullUser))

          // Check if onboarding is needed
          const needsOnboarding = !fullUser.mobile || (!fullUser.addresses?.length && !fullUser.detailedAddress?.flatNo)
          const destination = needsOnboarding ? '/onboarding' : '/services'

          setTimeout(() => navigate(destination, { replace: true }), 1200)
        })
        .catch(() => {
          // If profile fetch fails, still redirect — onboarding guard will catch it
          setTimeout(() => navigate('/onboarding', { replace: true }), 1200)
        })
    } catch (err) {
      setErrorMsg('Failed to process authentication data.')
      setStatus('error')
      setTimeout(() => navigate('/auth', { replace: true }), 3000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="min-h-screen bg-surface-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center max-w-sm w-full mx-4"
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center mx-auto mb-6 shadow-glow-md">
          <Zap size={28} className="text-white" />
        </div>

        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Loader2 size={36} className="text-primary-400 mx-auto animate-spin" />
            <h2 className="text-xl font-display font-bold text-white">Signing you in…</h2>
            <p className="text-surface-400 text-sm">Completing authentication</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <CheckCircle size={40} className="text-emerald-400 mx-auto" />
            <h2 className="text-xl font-display font-bold text-white">Welcome!</h2>
            <p className="text-surface-400 text-sm">Signed in successfully. Redirecting…</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <AlertCircle size={40} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-display font-bold text-white">Sign-in Failed</h2>
            <p className="text-surface-400 text-sm">{errorMsg}</p>
            <p className="text-surface-600 text-xs">Redirecting back to login…</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
