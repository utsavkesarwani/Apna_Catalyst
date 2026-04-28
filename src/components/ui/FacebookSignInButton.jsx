import { useState } from 'react'
import { motion } from 'framer-motion'

// Facebook "f" SVG logo
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 9C18 4.029 13.971 0 9 0S0 4.029 0 9c0 4.492 3.291 8.215 7.594 8.891v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.601h-2.097v6.29C14.709 17.215 18 13.492 18 9z"
      fill="#1877F2"
    />
  </svg>
)

/**
 * FacebookSignInButton
 * Redirects to /api/auth/facebook to initiate FB OAuth flow.
 */
export default function FacebookSignInButton({ label = 'Continue with Facebook', className = '' }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFacebookSignIn = () => {
    setIsLoading(true)
    const base = import.meta.env.VITE_SERVER_URL || ''
    window.location.href = `${base}/api/auth/facebook`
  }

  return (
    <motion.button
      type="button"
      id="facebook-signin-btn"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleFacebookSignIn}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3
        py-3 px-4 rounded-xl
        bg-[#1877F2]/10 hover:bg-[#1877F2]/20
        border border-[#1877F2]/20 hover:border-[#1877F2]/30
        text-white text-sm font-medium
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        <FacebookIcon />
      )}
      <span>{isLoading ? 'Redirecting to Facebook…' : label}</span>
    </motion.button>
  )
}
