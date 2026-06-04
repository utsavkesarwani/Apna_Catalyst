import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

// Demo electrician data — works WITHOUT backend
const DEMO_ELECTRICIAN = {
  _id: 'demo_elec_001',
  name: 'Rajesh Kumar (Demo)',
  email: 'rajesh@apnacatalyst.com',
  mobile: '9888888881',
  role: 'electrician',
  isApproved: true,
  isVerified: true,
  isSuspended: false,
  experience: 8,
  bio: 'Expert in full home wiring, panel upgrades, and smart home installations.',
  categories: ['Wiring', 'Fan Installation', 'MCB/Fuse', 'Smart Home'],
  location: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  rating: { avg: 4.8, count: 124 },
  availability: { isAvailable: true },
  earnings: { total: 48200, pending: 3200, thisMonth: 6800 },
  stats: { totalBookings: 156, completedBookings: 142, activeBookings: 2, pendingBookings: 1 },
  profilePhoto: '',
  createdAt: '2025-06-15T10:00:00Z',
}

export default function ElectricianLoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, setError, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  // ── Demo login — bypasses backend completely ──
  const handleDemoLogin = async () => {
    setDemoLoading(true)
    // Fake a short delay for UX
    await new Promise(r => setTimeout(r, 600))
    // Inject demo token + user into localStorage (AuthContext reads from there on mount)
    localStorage.setItem('apna_catalyst_token', 'demo_token_electrician_preview')
    localStorage.setItem('apna_catalyst_user', JSON.stringify(DEMO_ELECTRICIAN))
    // Also update live context state so ProtectedRoute passes immediately
    updateUser(DEMO_ELECTRICIAN)
    // Force a page reload so AuthContext re-initializes from localStorage
    window.location.href = '/electrician'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }

    try {
      await login(email, password)
      navigate('/electrician')
    } catch {
      // Error is handled in context
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl" />
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center shadow-glow-md group-hover:shadow-glow-lg transition-all duration-300">
                <Zap size={28} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold">
                <span className="text-white">Apna</span>
                <span className="gradient-text ml-1.5">Electro</span>
              </span>
              <p className="text-xs text-surface-500 font-medium tracking-wider uppercase">Electrician Panel</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-white">Welcome Back</h1>
            <p className="text-sm text-surface-500 mt-1">Sign in to your electrician account</p>
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
                  placeholder="you@example.com"
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
                  placeholder="Enter your password"
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
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-electric-500/40 text-electric-400 text-sm font-semibold hover:bg-electric-500/8 hover:border-electric-500/60 transition-all duration-300 disabled:opacity-60"
            >
              {demoLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Entering Demo...</>
              ) : (
                <><Sparkles size={16} /> Quick Demo Access (No backend needed)</>
              )}
            </button>
            <p className="text-center text-[10px] text-surface-600 mt-2">
              Loads sample data — for preview only
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link to="/join" className="block text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Want to join as an electrician?
            </Link>
            <Link to="/" className="block text-sm text-surface-500 hover:text-surface-300 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
