import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const DEMO_ADMIN = {
  _id: 'demo_admin_001',
  name: 'Super Admin (Demo)',
  email: 'admin@apnacatalyst.com',
  role: 'superadmin',
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin, loading, error, setError, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError(null)
    try {
      // Try real backend login with seeded admin credentials
      const response = await adminLogin('admin@apnacatalyst.com', 'admin123')
      // Explicitly persist token to localStorage before navigating
      // (useEffect may not fire before navigate triggers a re-render)
      if (response?.token) {
        localStorage.setItem('apna_catalyst_token', response.token)
        localStorage.setItem('apna_catalyst_user', JSON.stringify(response.user))
      }
      navigate('/superadmin')
    } catch {
      // Backend is down — fall back to demo-only mode (read-only preview)
      await new Promise(r => setTimeout(r, 400))
      localStorage.setItem('apna_catalyst_token', 'demo_token_admin_preview')
      localStorage.setItem('apna_catalyst_user', JSON.stringify(DEMO_ADMIN))
      updateUser(DEMO_ADMIN)
      navigate('/superadmin')
    } finally {
      setDemoLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }

    try {
      const response = await adminLogin(email, password)
      // Ensure token is persisted to localStorage before navigating
      if (response?.token) {
        localStorage.setItem('apna_catalyst_token', response.token)
        localStorage.setItem('apna_catalyst_user', JSON.stringify(response.user))
      }
      navigate('/superadmin')
    } catch {
      // Error is handled in context
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/3 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-glow-md group-hover:shadow-glow-lg transition-all duration-300">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold">
                <span className="text-white">Apna</span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-1.5">Admin</span>
              </span>
              <p className="text-xs text-surface-500 font-medium tracking-wider uppercase">Super Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8" style={{ borderColor: 'rgba(168, 85, 247, 0.15)' }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-white">Admin Access</h1>
            <p className="text-sm text-surface-500 mt-1">Sign in to the control center</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apnacatalyst.com"
                  className="input-field pl-11"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-800/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-900 text-xs text-surface-600">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-purple-500/40 text-purple-400 text-sm font-semibold hover:bg-purple-500/8 hover:border-purple-500/60 transition-all duration-300 disabled:opacity-60"
            >
              {demoLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Entering Demo...</>
              ) : (
                <><Sparkles size={16} /> Quick Demo Access (No backend needed)</>
              )}
            </button>
            <p className="text-center text-[10px] text-surface-600 mt-2">Loads mock data — for preview only</p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link to="/" className="block text-sm text-surface-500 hover:text-surface-300 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
