import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Phone, MapPin, ArrowRight, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../api/user.api'
import Button from '../components/ui/Button'

/**
 * OnboardingPage
 * Mandatory post-login step for users with incomplete profiles.
 * Collects: Mobile Number + 6 address fields.
 * Redirects to /services on successful submission.
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    mobile: user?.mobile || '',
    flatNo: user?.detailedAddress?.flatNo || '',
    locality: user?.detailedAddress?.locality || '',
    landmark: user?.detailedAddress?.landmark || '',
    city: user?.detailedAddress?.city || user?.location?.city || '',
    state: user?.detailedAddress?.state || user?.location?.state || '',
    pincode: user?.detailedAddress?.pincode || user?.location?.pincode || '',
  })

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // ── Validation: all 7 fields must be non-empty ──
  const mobileValid = /^[6-9]\d{9}$/.test(form.mobile)
  const pincodeValid = /^\d{6}$/.test(form.pincode)
  const allFilled = form.flatNo.trim() && form.locality.trim() && form.landmark.trim() &&
    form.city.trim() && form.state.trim()
  const isFormValid = mobileValid && pincodeValid && allFilled

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setError(null)
    try {
      const payload = {
        mobile: form.mobile,
        detailedAddress: {
          flatNo: form.flatNo.trim(),
          locality: form.locality.trim(),
          landmark: form.landmark.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        // Also sync the top-level location fields
        location: {
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      }

      const response = await updateUserProfile(payload)
      updateUser(response.user)
      setSuccess(true)

      // Redirect to services page after brief success flash
      setTimeout(() => navigate('/services', { replace: true }), 1000)
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      key: 'mobile',
      label: 'Mobile Number',
      type: 'tel',
      placeholder: 'e.g. 9876543210',
      icon: Phone,
      prefix: '+91',
      onChange: (v) => updateField('mobile', v.replace(/\D/g, '').slice(0, 10)),
      helperError: form.mobile && !mobileValid ? 'Enter a valid 10-digit number starting with 6–9' : null,
    },
    { key: 'flatNo', label: 'Flat / House No. / Building Name', placeholder: 'e.g. Flat 302, Sunrise Towers', icon: MapPin },
    { key: 'locality', label: 'Street / Colony / Area', placeholder: 'e.g. MG Road, Sector 12', icon: MapPin },
    { key: 'landmark', label: 'Landmark (e.g. Near, Opposite)', placeholder: 'e.g. Near City Mall', icon: MapPin },
    { key: 'city', label: 'City', placeholder: 'e.g. Jaipur', icon: MapPin },
    { key: 'state', label: 'State', placeholder: 'e.g. Rajasthan', icon: MapPin },
    {
      key: 'pincode',
      label: 'Pincode',
      type: 'tel',
      placeholder: 'e.g. 302001',
      icon: MapPin,
      onChange: (v) => updateField('pincode', v.replace(/\D/g, '').slice(0, 6)),
      helperError: form.pincode && !pincodeValid ? 'Enter a valid 6-digit pincode' : null,
    },
  ]

  return (
    <section className="min-h-screen bg-surface-950 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center mx-auto mb-5 shadow-glow-md">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-surface-400 text-sm max-w-sm mx-auto">
            We need a few details to provide you the best service experience.
            {user?.name && <span className="block mt-1 text-primary-400 font-medium">Welcome, {user.name}!</span>}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-400">Profile saved! Redirecting to services…</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Progress hint */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">All fields required</span>
              <span className={`text-xs font-medium ${isFormValid ? 'text-emerald-400' : 'text-surface-500'}`}>
                {Object.values(form).filter(v => v.trim()).length} / 7 filled
              </span>
            </div>

            {fields.map((field, i) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <label className="text-sm font-medium text-surface-300 mb-1.5 block">
                  {field.label} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm font-medium">
                      {field.prefix}
                    </span>
                  )}
                  <input
                    type={field.type || 'text'}
                    required
                    value={form[field.key]}
                    onChange={(e) =>
                      field.onChange
                        ? field.onChange(e.target.value)
                        : updateField(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                    className={`input-field w-full ${field.prefix ? 'pl-14' : ''}`}
                  />
                </div>
                {field.helperError && (
                  <p className="mt-1 text-xs text-red-400">{field.helperError}</p>
                )}
              </motion.div>
            ))}

            <div className="pt-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                type="submit"
                icon={loading ? Loader2 : ArrowRight}
                iconPosition="right"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Saving…' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Trust Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-surface-600"
        >
          <Shield size={14} />
          <span>Your information is secure & encrypted</span>
        </motion.div>
      </div>
    </section>
  )
}
