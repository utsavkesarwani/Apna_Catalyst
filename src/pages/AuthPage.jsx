import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, Lock, ArrowRight, Zap, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import GoogleSignInButton from '../components/ui/GoogleSignInButton'
import FacebookSignInButton from '../components/ui/FacebookSignInButton'

// ── Feature Flag: set to true to re-enable Mobile OTP login ──
const ENABLE_MOBILE_OTP = false

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userLogin, userRegister, sendOTP, verifyOTP, loading, error, setError } = useAuth()

  const returnTo = location.state?.from || '/'

  const [mode, setMode] = useState('login') // login | register | otp | otp-name
  const [method, setMethod] = useState(ENABLE_MOBILE_OTP ? 'mobile' : 'email') // mobile | email
  const [form, setForm] = useState({ mobile: '', email: '', password: '', name: '', otp: '' })
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [successMsg, setSuccessMsg] = useState('')
  const [devOtp, setDevOtp] = useState(null) // Dev mode OTP display

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleOtpInput = (index, value) => {
    if (value.length > 1) value = value[0]
    const newDigits = [...otpDigits]
    newDigits[index] = value
    setOtpDigits(newDigits)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await sendOTP(form.mobile)
      setSuccessMsg(response.message || 'OTP sent!')
      // In dev mode, show the OTP
      if (response.otp) setDevOtp(response.otp)
      setMode('otp')
    } catch (err) {
      // error is set by context
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError(null)
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }
    try {
      const response = await verifyOTP(form.mobile, otp, form.name || undefined)
      if (response.isNewUser) {
        // Need name first
        setMode('otp-name')
        return
      }
      // Logged in successfully
      setSuccessMsg('Welcome back!')
      setTimeout(() => navigate(returnTo, { replace: true }), 500)
    } catch (err) {
      // error is set by context
    }
  }

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    const otp = otpDigits.join('')
    try {
      await verifyOTP(form.mobile, otp, form.name)
      setSuccessMsg('Account created! Welcome!')
      setTimeout(() => navigate(returnTo, { replace: true }), 500)
    } catch (err) {
      // error is set by context
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'register') {
        await userRegister({
          name: form.name,
          email: form.email,
          password: form.password,
          mobile: form.mobile || undefined,
        })
        setSuccessMsg('Account created successfully!')
      } else {
        await userLogin(form.email, form.password)
        setSuccessMsg('Welcome back!')
      }
      setTimeout(() => navigate(returnTo, { replace: true }), 500)
    } catch (err) {
      // error is set by context
    }
  }

  const handleSubmit = (e) => {
    if (method === 'mobile') {
      handleSendOTP(e)
    } else {
      handleEmailAuth(e)
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center mx-auto mb-4 shadow-glow-md">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            {mode === 'otp' ? 'Verify OTP'
              : mode === 'otp-name' ? 'Complete Registration'
              : mode === 'register' ? 'Create Account'
              : 'Welcome Back'}
          </h1>
          <p className="text-surface-400 text-sm">
            {mode === 'otp'
              ? `We sent a code to +91 ${form.mobile}`
              : mode === 'otp-name'
              ? 'Just one more step — tell us your name'
              : 'Sign in to access bookings and track services'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-400">{successMsg}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* OTP Name Step */}
            {mode === 'otp-name' ? (
              <motion.form
                key="otp-name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCompleteRegistration}
                className="space-y-5"
              >
                <div>
                  <label className="text-sm font-medium text-surface-300 mb-2 block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <Button
                  variant="primary" size="lg" className="w-full" type="submit"
                  icon={loading ? Loader2 : ArrowRight} iconPosition="right"
                  disabled={loading || !form.name.trim()}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </motion.form>
            ) : mode === 'otp' ? (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-5"
              >
                {/* Dev OTP display */}
                {devOtp && (
                  <div className="p-2 rounded-lg bg-accent-500/10 border border-accent-500/20 text-center">
                    <span className="text-xs text-accent-400">Dev Mode OTP: <strong className="font-mono">{devOtp}</strong></span>
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="text-sm font-medium text-surface-300 mb-2 block">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-center">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="input-field text-center text-lg font-mono font-bold w-12 h-12"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary" size="lg" className="w-full" type="submit"
                  icon={loading ? Loader2 : ArrowRight} iconPosition="right"
                  disabled={loading || otpDigits.join('').length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <p className="text-center text-xs text-surface-500">
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    className="text-primary-400 hover:underline"
                    onClick={() => { setOtpDigits(['','','','','','']); handleSendOTP({ preventDefault: () => {} }) }}
                  >
                    Resend OTP
                  </button>
                </p>

                <button
                  type="button"
                  onClick={() => { setMode('login'); setOtpDigits(['','','','','','']); setDevOtp(null); setError(null) }}
                  className="text-sm text-surface-400 hover:text-white transition-colors w-full text-center"
                >
                  ← Back to login
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Method Tabs — hidden when Mobile OTP is disabled */}
                {ENABLE_MOBILE_OTP && (
                  <div className="flex rounded-xl bg-surface-800/50 p-1">
                    <button
                      type="button"
                      onClick={() => { setMethod('mobile'); setError(null) }}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                        method === 'mobile'
                          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                          : 'text-surface-400 hover:text-surface-200'
                      }`}
                    >
                      <Phone size={14} /> Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMethod('email'); setError(null) }}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                        method === 'email'
                          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                          : 'text-surface-400 hover:text-surface-200'
                      }`}
                    >
                      <Mail size={14} /> Email
                    </button>
                  </div>
                )}

                {/* Register: Name */}
                {mode === 'register' && (
                  <div>
                    <label className="text-sm font-medium text-surface-300 mb-2 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Your full name"
                      className="input-field"
                    />
                  </div>
                )}

                {/* Mobile / Email */}
                {ENABLE_MOBILE_OTP && method === 'mobile' ? (
                  <div>
                    <label className="text-sm font-medium text-surface-300 mb-2 block">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        required
                        value={form.mobile}
                        onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="XXXXX XXXXX"
                        className="input-field pl-14"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-surface-300 mb-2 block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 mb-2 block">Password</label>
                      <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                      />
                    </div>
                    {mode === 'register' && (
                      <div>
                        <label className="text-sm font-medium text-surface-300 mb-2 block">Mobile Number (Optional)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm font-medium">+91</span>
                          <input
                            type="tel"
                            value={form.mobile}
                            onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="XXXXX XXXXX"
                            className="input-field pl-14"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Button
                  variant="primary" size="lg" className="w-full" type="submit"
                  icon={loading ? Loader2 : ArrowRight} iconPosition="right"
                  disabled={loading}
                >
                  {loading
                    ? 'Please wait...'
                    : ENABLE_MOBILE_OTP && method === 'mobile'
                    ? 'Send OTP'
                    : mode === 'register'
                    ? 'Create Account'
                    : 'Sign In'}
                </Button>

                {/* Google OAuth divider + button */}
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-surface-500 whitespace-nowrap">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <GoogleSignInButton
                  label={mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
                />

                <FacebookSignInButton
                  label={mode === 'register' ? 'Sign up with Facebook' : 'Continue with Facebook'}
                />

                {/* Toggle */}
                <p className="text-center text-sm text-surface-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-surface-600"
        >
          <Shield size={14} />
          <span>Your data is secure & encrypted</span>
        </motion.div>
      </div>
    </section>
  )
}
