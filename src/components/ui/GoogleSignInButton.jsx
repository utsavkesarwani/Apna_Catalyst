import { useState } from 'react'
import { motion } from 'framer-motion'

// Google "G" SVG logo (official brand colors, no external image needed)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
)

/**
 * GoogleSignInButton
 * Initiates the Google OAuth flow by redirecting to the server's /api/auth/google endpoint.
 * The server handles the Passport strategy; the frontend just needs to navigate there.
 *
 * @param {string}  label      - Button text (default: 'Continue with Google')
 * @param {string}  className  - Additional CSS classes
 */
export default function GoogleSignInButton({ label = 'Continue with Google', className = '' }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    // Full-page redirect to the server's OAuth initiation endpoint.
    // In dev: Vite proxy forwards /api → http://127.0.0.1:5000
    // In prod: set VITE_API_BASE_URL (without /api) or use a relative path if same-origin
    const base = import.meta.env.VITE_SERVER_URL || ''
    window.location.href = `${base}/api/auth/google`
  }

  return (
    <motion.button
      type="button"
      id="google-signin-btn"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3
        py-3 px-4 rounded-xl
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-white/20
        text-white text-sm font-medium
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span>{isLoading ? 'Redirecting to Google…' : label}</span>
    </motion.button>
  )
}
